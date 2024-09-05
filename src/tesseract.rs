use warp::tesseract::Tesseract;
use wasm_bindgen::prelude::*;

use crate::stream::AsyncIterator;

#[wasm_bindgen]
impl Tesseract {
    #[wasm_bindgen(js_name = set)]
    pub fn set_wasm(&self, key: &str, value: &str) -> std::result::Result<(), JsError> {
        self.set(key, value).map_err(|e| e.into())
    }

    #[wasm_bindgen(js_name = retrieve)]
    pub fn retrieve_wasm(&self, key: &str) -> std::result::Result<String, JsError> {
        self.retrieve(key).map_err(|e| e.into())
    }

    #[wasm_bindgen(js_name = update_unlock)]
    pub fn update_unlock_wasm(
        &self,
        old_passphrase: &[u8],
        new_passphrase: &[u8],
    ) -> std::result::Result<(), JsError> {
        self.update_unlock(old_passphrase, new_passphrase)
            .map_err(|e| e.into())
    }

    #[wasm_bindgen(js_name = delete)]
    pub fn delete_wasm(&self, key: &str) -> std::result::Result<(), JsError> {
        self.delete(key).map_err(|e| e.into())
    }

    #[wasm_bindgen(js_name = unlock)]
    pub fn unlock_wasm(&self, passphrase: &[u8]) -> std::result::Result<(), JsError> {
        self.unlock(passphrase).map_err(|e| e.into())
    }

    #[wasm_bindgen(js_name = save)]
    pub fn save_wasm(&self) -> std::result::Result<(), JsError> {
        self.save().map_err(|e| e.into())
    }

    #[wasm_bindgen(js_name = subscribe)]
    pub fn subscribe_wasm(&self) -> AsyncIterator {
        AsyncIterator::new(Box::pin(self.subscribe().map(|t| Into::<JsValue>::into(t))))
    }
}