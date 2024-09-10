use futures::StreamExt;
use wasm_bindgen::prelude::*;

use crate::warp::stream::AsyncIterator;

#[wasm_bindgen]
pub struct Tesseract(warp::tesseract::Tesseract);

impl From<warp::tesseract::Tesseract> for Tesseract {
    fn from(value: warp::tesseract::Tesseract) -> Self {
        Tesseract(value)
    }
}
impl From<Tesseract> for warp::tesseract::Tesseract {
    fn from(value: Tesseract) -> Self {
        value.0
    }
}

#[wasm_bindgen]
impl Tesseract {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Tesseract {
        Tesseract(warp::tesseract::Tesseract::new())
    }
    
    pub fn set_autosave(&self) {
        self.0.set_autosave()
    }
    
    pub fn autosave_enabled(&self) -> bool {
        self.0.autosave_enabled()
    }

    pub fn disable_key_check(&self) {
        self.0.disable_key_check()
    }
    
    pub fn enable_key_check(&self) {
        self.0.enable_key_check()
    }
    
    pub fn is_key_check_enabled(&self) -> bool {
        self.0.is_key_check_enabled()
    }
    
    pub fn exist(&self, key: &str) -> bool {
        self.0.exist(key)
    }
    
    pub fn clear(&self) {
        self.0.clear()
    }
    
    pub fn is_unlock(&self) -> bool {
        self.0.is_unlock()
    }

    pub fn lock(&self) {
        self.0.lock();
    }

    pub fn set(&self, key: &str, value: &str) -> std::result::Result<(), JsError> {
        self.0.set(key, value).map_err(|e| e.into())
    }

    pub fn retrieve(&self, key: &str) -> std::result::Result<String, JsError> {
        self.0.retrieve(key).map_err(|e| e.into())
    }

    pub fn update_unlock(
        &self,
        old_passphrase: &[u8],
        new_passphrase: &[u8],
    ) -> std::result::Result<(), JsError> {
        self.0.update_unlock(old_passphrase, new_passphrase)
            .map_err(|e| e.into())
    }

    pub fn delete(&self, key: &str) -> std::result::Result<(), JsError> {
        self.0.delete(key).map_err(|e| e.into())
    }

    pub fn unlock(&self, passphrase: &[u8]) -> std::result::Result<(), JsError> {
        self.0.unlock(passphrase).map_err(|e| e.into())
    }

    pub fn save(&self) -> std::result::Result<(), JsError> {
        self.0.save().map_err(|e| e.into())
    }

    pub fn subscribe(&self) -> AsyncIterator {
        AsyncIterator::new(Box::pin(self.0.subscribe().map(|t| Into::<JsValue>::into(Into::<TesseractEvent>::into(t)))))
    }

    pub fn load_from_storage(&self) -> std::result::Result<(), JsError> {
        self.0.load_from_storage().map_err(|e| e.into())
    }
}

#[wasm_bindgen]
pub enum TesseractEvent {
    Unlocked,
    Locked
}
impl From<warp::tesseract::TesseractEvent> for TesseractEvent {
    fn from(value: warp::tesseract::TesseractEvent) -> Self {
        match value {
            warp::tesseract::TesseractEvent::Unlocked => TesseractEvent::Unlocked,
            warp::tesseract::TesseractEvent::Locked => TesseractEvent::Locked,
        }
    }
}