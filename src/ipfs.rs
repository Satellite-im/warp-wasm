use std::path::PathBuf;

use warp::tesseract::Tesseract;
use warp_ipfs::{WarpIpfs, config::Config};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
impl WarpIpfs {
    #[wasm_bindgen(constructor)]
    pub async fn new_wasm(
        config: Config,
        tesseract: Option<Tesseract>,
    ) -> crate::WarpInstance {
        let warp_ipfs = WarpIpfs::new(config, tesseract).await;
        let mp = Box::new(warp_ipfs.clone()) as Box<_>;
        let rg = Box::new(warp_ipfs.clone()) as Box<_>;
        let fs = Box::new(warp_ipfs.clone()) as Box<_>;
        crate::WarpInstance::new(mp, rg, fs)
    }
}

#[wasm_bindgen]
impl Config {
    #[wasm_bindgen]
    pub fn with_path(&mut self, path: String) {
        self.path = Some(PathBuf::from(&path))
    }

    #[wasm_bindgen]
    pub fn set_persistence(&mut self, persist: bool) {
        self.persist = persist
    }

    #[wasm_bindgen]
    pub fn set_relay_enabled(&mut self, enable: bool) {
        self.enable_relay = enable
    }

    #[wasm_bindgen]
    pub fn set_save_phrase(&mut self, save: bool) {
        self.save_phrase = save
    }

    #[wasm_bindgen]
    pub fn set_max_storage_size(&mut self, size: Option<usize>) {
        self.max_storage_size = size
    }

    #[wasm_bindgen]
    pub fn set_max_file_size(&mut self, size: Option<usize>) {
        self.max_file_size = size
    }

    #[wasm_bindgen]
    pub fn set_thumbnail_size(&mut self, size_x: u32, size_y: u32) {
        self.thumbnail_size = (size_x, size_y)
    }

    #[wasm_bindgen]
    pub fn with_thumbnail_exact_format(&mut self, exact: bool) {
        self.thumbnail_exact_format = exact
    }
}