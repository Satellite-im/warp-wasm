use std::path::PathBuf;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct WarpIpfs(warp_ipfs::WarpIpfs);

#[wasm_bindgen]
impl WarpIpfs {
    #[wasm_bindgen(constructor)]
    pub async fn new(
        config: Config,
        tesseract: Option<crate::warp::tesseract::Tesseract>,
    ) -> crate::warp::WarpInstance {
        let warp_ipfs = warp_ipfs::WarpIpfs::new(config.0, tesseract.map(|t| t.into())).await;
        let mp = Box::new(warp_ipfs.clone()) as Box<_>;
        let rg = Box::new(warp_ipfs.clone()) as Box<_>;
        let fs = Box::new(warp_ipfs.clone()) as Box<_>;
        crate::warp::WarpInstance::new(mp, rg, fs)
    }
}

#[wasm_bindgen]
pub struct Config(warp_ipfs::config::Config);

#[wasm_bindgen]
impl Config {
    pub fn with_path(&mut self, path: String) {
        self.0.with_path(path);
    }

    pub fn set_persistence(&mut self, persist: bool) {
        self.0.set_persistence(persist);
    }

    pub fn set_relay_enabled(&mut self, enable: bool) {
        self.0.set_relay_enabled(enable);
    }

    pub fn set_save_phrase(&mut self, save: bool) {
        self.0.set_save_phrase(save);
    }

    pub fn set_max_storage_size(&mut self, size: Option<usize>) {
        self.0.set_max_storage_size(size);
    }

    pub fn set_max_file_size(&mut self, size: Option<usize>) {
        self.0.set_max_file_size(size);
    }

    pub fn set_thumbnail_size(&mut self, size_x: u32, size_y: u32) {
        self.0.set_thumbnail_size(size_x, size_y);
    }

    pub fn with_thumbnail_exact_format(&mut self, exact: bool) {
        self.0.with_thumbnail_exact_format(exact);
    }

    pub fn development() -> Config {
        Config(warp_ipfs::config::Config::default())
    }

    pub fn testing() -> Config {
        Config(warp_ipfs::config::Config::testing())
    }

    pub fn minimal_testing() -> Config {
        Config(warp_ipfs::config::Config::minimal_testing())
    }

    pub fn minimal_basic() -> Config {
        Config(warp_ipfs::config::Config::minimal_basic())
    }

    pub fn minimal_with_relay(addresses: Vec<String>) -> Config {
        Config(warp_ipfs::config::Config::minimal_with_relay(addresses))
    }
}