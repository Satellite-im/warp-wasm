extern crate proc_macro2;

use proc_macro::TokenStream;

mod wasm_convert;

/// Easy type conversion between enums and structs of similar structure
/// 
/// Also allows specifying a function for conversion for types not implementing From already
/// 
/// Fields can accept an attribute with name "from" or "into" representing a conversion function.
/// 
/// This value can either be a path to a function or some rust code. 
/// 
/// The path need to accept a single value of the current type and output the target type
/// 
/// Unnamed enum fields are referenced as f_0, f_1...
/// E.g. `"{f_0}.converter_function()"`
/// ```
/// use macro_utils::FromTo;
/// 
/// #[derive(Debug)]
/// pub enum A {
///     SomeValue1,
///     SomeValue2
/// }
/// 
/// #[derive(FromTo, PartialEq, Debug)]
/// #[from_to(A)]
/// pub enum B {
///     SomeValue1,
///     SomeValue2
/// }
/// 
/// assert_eq!(A::SomeValue1, B::SomeValue1.into());
/// 
/// pub struct S1 {
///     x: i64,
///     y: i128
/// }
/// 
/// #[derive(FromTo)]
/// #[from_to(A)]
/// pub struct S2 {
///     x: i64,
///     y: i128
/// }
/// 
/// #[derive(FromTo)]
/// #[from_to(A)]
/// pub struct S3 {
///     // Pass in a custom conversion function. If not provided will use a From implementation
///     #[from_to(from = "converter_function_from", to = "converter_function_to")]
///     // Referencing the struct itself is also possible
///     #[from_to(from = "{value}.x.converter_function()", to = "{value}.x.converter_function()")]
///     x: String,
///     #[from_to(from = "converter_function_from", to = "converter_function_to")]
///     y: String
/// }
/// ```
#[proc_macro_derive(FromTo, attributes(from_to))]
pub fn from_to(input: TokenStream) -> TokenStream {
    wasm_convert::expand(input)
        .unwrap_or_else(|e| e.into_compile_error().into())
        .into()
}