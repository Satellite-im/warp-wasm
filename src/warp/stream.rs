use futures::{stream::BoxStream, Stream, StreamExt};
use js_sys::{Object, Promise};
use std::pin::Pin;
use std::sync::{Arc, Mutex};
use std::task::{Context, Poll};
use wasm_bindgen::prelude::*;
use web_sys::{ReadableStream, ReadableStreamDefaultController};

/// Wraps BoxStream<'static, TesseractEvent> into a js compatible struct
/// Currently there is no generic way for this so on JS-side this returns any
#[wasm_bindgen]
pub struct AsyncIterator {
    inner: BoxStream<'static, JsValue>,
}
impl AsyncIterator {
    pub fn new(stream: BoxStream<'static, JsValue>) -> Self {
        Self { inner: stream }
    }
}

/// Provides the next() function expected by js async iterator
#[wasm_bindgen]
impl AsyncIterator {
    /// Next value in this iterator. Due to wasm limitations can only return any type
    /// Refer to implementations for more info
    pub async fn next(&mut self) -> std::result::Result<Promise, JsError> {
        let next = self.inner.next().await;
        match next {
            Some(value) => Ok(Promise::resolve(&PromiseResult::new(value.into()).into())),
            None => std::result::Result::Err(JsError::new("returned None")),
        }
    }
}

/// Wraps in the TesseractEvent promise result in the js object expected by js async iterator
#[wasm_bindgen]
struct PromiseResult {
    value: JsValue,
    pub done: bool,
}

#[wasm_bindgen]
impl PromiseResult {
    pub fn new(value: JsValue) -> Self {
        Self { value, done: false }
    }

    #[wasm_bindgen(getter)]
    pub fn value(&self) -> JsValue {
        self.value.clone()
    }
}

pub struct InnerStream {
    inner: send_wrapper::SendWrapper<wasm_streams::readable::IntoStream<'static>>,
}

impl From<wasm_streams::ReadableStream> for InnerStream {
    fn from(stream: wasm_streams::ReadableStream) -> Self {
        Self {
            inner: send_wrapper::SendWrapper::new(stream.into_stream()),
        }
    }
}

impl Stream for InnerStream {
    type Item = std::io::Result<bytes::Bytes>;
    fn poll_next(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
        let this = &mut *self;
        match futures::ready!(Pin::new(&mut this.inner).poll_next(cx)) {
            Some(Ok(val)) => {
                let bytes = serde_wasm_bindgen::from_value(val).expect("valid bytes");
                return Poll::Ready(Some(Ok(bytes)));
            }
            Some(Err(e)) => {
                //TODO: Make inner stream optional and take from stream to prevent repeated polling
                let str: String = serde_wasm_bindgen::from_value(e).expect("valid string");
                return Poll::Ready(Some(Err(std::io::Error::other(str))));
            }
            _ => {
                // Any other condition should cause this stream to end
                return Poll::Ready(None);
            }
        }
    }
}

/// converts a Stream to a ReadableStream
pub fn stream_to_readablestream(stream: BoxStream<'static, JsValue>) -> web_sys::ReadableStream {
    // We encase the stream in mutex as a temporary workaround, but since the scope would have sole access that is not shared, we do not need to worry about deadlocks or borrowed access
    let stream = Arc::new(Mutex::new(stream));
    let closure = Closure::wrap(Box::new({
        move |controller: ReadableStreamDefaultController| {
            let stream = stream.clone();
            wasm_bindgen_futures::spawn_local(async move {
                let stream = &mut *stream.lock().unwrap();
                while let Some(item) = stream.next().await {
                    controller.enqueue_with_chunk(&item).unwrap();
                }
                controller.close().unwrap();
            });
        }
    }) as Box<dyn FnMut(_)>);

    let object = Object::new();

    js_sys::Reflect::set(&object, &JsValue::from("start"), &closure.as_ref().unchecked_ref()).unwrap();

    closure.forget();

    let readable_st = ReadableStream::new_with_underlying_source(&object).unwrap();

    readable_st
}