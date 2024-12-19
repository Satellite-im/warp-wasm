use proc_macro::TokenStream;
use quote::{format_ident, quote};
use syn::{
    parse::{Parse, Parser},
    punctuated::Punctuated,
    Attribute, Data, DataEnum, DeriveInput, Error, Expr, Field, Fields, Lit, Meta, Path, Result,
    Token, Type,
};

const ATTRIBUTE_PATH: &str = "from_to";
const ATTRIBUTE_FROM: &str = "from";
const ATTRIBUTE_INTO: &str = "into";
const ATTRIBUTE_ONLY: &str = "only";

pub fn expand(input: TokenStream) -> Result<TokenStream> {
    let input: DeriveInput = DeriveInput::parse.parse(input.clone())?;
    let conv = if let Some(attr) = input.attrs.iter().find_map(|attr| {
        if attr.path().is_ident(ATTRIBUTE_PATH) {
            return Some(attr);
        }
        None
    }) {
        parse_attributes(attr)?
    } else {
        return Err(Error::new_spanned(
            input,
            format!("Required target missing"),
        ));
    };
    let target = conv.target;

    let name = &input.ident;

    let expanded = match &input.data {
        Data::Struct(data_struct) => {
            let mut names = vec![];
            let mut conv_into = vec![];
            let mut conv_from = vec![];
            for field in data_struct.fields.iter() {
                let ident = &field.ident;
                names.push(quote! {#ident});
                let conv = convert_field(field, quote! {value.#ident})?;
                conv_from.push(conv.0);
                conv_into.push(conv.1);
            }
            (
                quote! {
                    impl From<#target> for #name {
                        fn from(value: #target) -> Self {
                            Self {
                                #(#conv_from),*
                            }
                        }
                    }
                },
                quote! {
                    impl From<#name> for #target {
                        fn from(value: #name) -> Self {
                            Self {
                                #(#conv_into),*
                            }
                        }
                    }
                },
            )
        }
        Data::Enum(data_enum) => expand_enum(name, &target, data_enum)?,
        _ => {
            return Err(Error::new_spanned(
                input,
                format!("Only enum and structs are supported"),
            ));
        }
    };
    let mut stream = proc_macro2::TokenStream::new();
    if matches!(conv.impls, Impls::All | Impls::FromOnly) {
        stream.extend(expanded.0);
    }
    if matches!(conv.impls, Impls::All | Impls::IntoOnly) {
        stream.extend(expanded.1);
    }
    Ok(TokenStream::from(stream))
}

fn expand_enum(
    name: &proc_macro2::Ident,
    target: &Path,
    data_enum: &DataEnum,
) -> Result<(proc_macro2::TokenStream, proc_macro2::TokenStream)> {
    let mut from = vec![];
    let mut to = vec![];
    for v in data_enum.variants.iter() {
        let ident = &v.ident;
        match &v.fields {
            Fields::Named(fields) => {
                let mut names = vec![];
                let mut conv_into = vec![];
                let mut conv_from = vec![];
                for field in fields.named.iter() {
                    let ident = &field.ident;
                    names.push(quote! {#ident});
                    let conv = convert_field(field, quote! {#ident})?;
                    conv_from.push(conv.0);
                    conv_into.push(conv.1);
                }
                from.push(quote! {
                    #target::#ident{#(#names),*} => #name::#ident{#(#conv_into),*},
                });
                to.push(quote! {
                    #name::#ident{#(#names),*} => #target::#ident{#(#conv_from),*},
                })
            }
            Fields::Unnamed(fields) => {
                let mut names = vec![];
                let mut conv_into = vec![];
                let mut conv_from = vec![];
                for (i, field) in fields.unnamed.iter().enumerate() {
                    let ident = format_ident!("f_{}", i);
                    names.push(quote! {#ident});
                    let conv = convert_field(field, quote! {#ident})?;
                    conv_from.push(conv.0);
                    conv_into.push(conv.1);
                }
                from.push(quote! {
                    #target::#ident(#(#names),*) => #name::#ident(#(#conv_into),*),
                });
                to.push(quote! {
                    #name::#ident(#(#names),*) => #target::#ident(#(#conv_from),*),
                });
            }
            Fields::Unit => {
                from.push(quote! {
                    #target::#ident => #name::#ident,
                });
                to.push(quote! {
                    #name::#ident => #target::#ident,
                })
            }
        }
    }
    Ok((
        quote! {
            impl From<#target> for #name {
                fn from(value: #target) -> Self {
                    match value {
                        #(#from)*
                    }
                }
            }
        },
        quote! {
            impl From<#name> for #target {
                fn from(value: #name) -> Self {
                    match value {
                        #(#to)*
                    }
                }
            }
        },
    ))
}

fn parse_attributes(attr: &Attribute) -> Result<Conversion> {
    let nested = attr
        .parse_args_with(Punctuated::<Meta, Token![,]>::parse_terminated)
        .unwrap();
    let mut path_r = None;
    let mut impls = Impls::All;
    for meta in nested {
        match &meta {
            Meta::NameValue(val) => {
                if val.path.is_ident(ATTRIBUTE_ONLY) {
                    if let Expr::Lit(lit) = &val.value {
                        if let Lit::Str(s) = &lit.lit {
                            if s.value().eq("into") {
                                impls = Impls::IntoOnly
                            } else if s.value().eq("from") {
                                impls = Impls::FromOnly
                            }
                        }
                    } else {
                        return Err(Error::new_spanned(meta, format!("Invalid requirements")));
                    }
                }
            }
            Meta::Path(path) => path_r = Some(path.clone()),
            _ => return Err(Error::new_spanned(&meta, format!("Unknown attribute"))),
        }
    }
    Ok(Conversion {
        target: path_r.expect("No valid target provided"),
        impls,
    })
}

fn convert_field(
    field: &Field,
    variable_ref: proc_macro2::TokenStream,
) -> Result<(proc_macro2::TokenStream, proc_macro2::TokenStream)> {
    let attributes = field
        .attrs
        .iter()
        .find(|attr| attr.path().is_ident(ATTRIBUTE_PATH));
    let conv = if let Some(attr) = attributes {
        let nested = attr
            .parse_args_with(Punctuated::<Meta, Token![,]>::parse_terminated)
            .unwrap();
        let mut from = None;
        let mut to = None;
        for meta in &nested {
            if meta.path().is_ident(ATTRIBUTE_FROM) {
                from = Some(get_path(meta)?);
            } else if meta.path().is_ident(ATTRIBUTE_INTO) {
                to = Some(get_path(meta)?);
            } else {
                return Err(Error::new_spanned(meta, format!("Unknown attribute")));
            }
        }
        ConversionAttributes { from, to }
    } else {
        ConversionAttributes {
            from: None,
            to: None,
        }
    };
    // If string use to_string()
    let is_string = if let Type::Path(p) = &field.ty {
        p.path.is_ident("String") | p.path.is_ident("std::string::String")
    } else {
        false
    };
    let converter = |opt: Option<ConversionAtt>| {
        if let Some(p) = opt {
            p.as_token(&variable_ref)
        } else {
            if is_string {
                Ok(quote! {
                    #variable_ref.to_string()
                })
            } else {
                Ok(quote! {
                    #variable_ref.into()
                })
            }
        }
    };
    let mut from = converter(conv.from)?;
    let mut to = converter(conv.to)?;
    if let Some(ident) = &field.ident {
        from = quote! {
            #ident: #from
        };
        to = quote! {
            #ident: #to
        };
    }
    Ok((from, to))
}

fn get_path(meta: &Meta) -> Result<ConversionAtt> {
    if let Meta::NameValue(meta) = &meta {
        if let Expr::Lit(expr) = &meta.value {
            if let Lit::Str(lit_str) = &expr.lit {
                if let Ok(path) = lit_str.parse::<Path>() {
                    return Ok(ConversionAtt::Path(path));
                }
                return Ok(ConversionAtt::Func(lit_str.value()));
            }
        }
    }
    Err(Error::new_spanned(meta, "expected a path"))
}

enum Impls {
    All,
    FromOnly,
    IntoOnly,
}

struct Conversion {
    target: Path,
    impls: Impls,
}

struct ConversionAttributes {
    from: Option<ConversionAtt>,
    to: Option<ConversionAtt>,
}

enum ConversionAtt {
    Path(Path),
    Func(String),
}

impl ConversionAtt {
    fn as_token(
        &self,
        variable_ref: &proc_macro2::TokenStream,
    ) -> Result<proc_macro2::TokenStream> {
        match self {
            ConversionAtt::Path(path) => Ok(quote! {
                #path(#variable_ref)
            }),
            ConversionAtt::Func(func) => {
                let s = func.replace("{value}", "value");
                syn::parse_str(&s)
            }
        }
    }
}
