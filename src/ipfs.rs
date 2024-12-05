use wasm_bindgen::prelude::*;
use std::str::FromStr;

#[wasm_bindgen]
pub struct WarpIpfs;

#[wasm_bindgen]
impl WarpIpfs {
    #[wasm_bindgen(constructor)]
    pub async fn new(
        config: Config,
        tesseract: Option<crate::warp::tesseract::Tesseract>,
    ) -> crate::warp::WarpInstance {
        let mut builder = warp_ipfs::WarpIpfsBuilder::default().set_config(config.0);
        if let Some(tesseract) = tesseract {
            builder = builder.set_tesseract(tesseract.into());
        }
        let instance = builder.await;
        crate::warp::WarpInstance::new(instance)
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

    /// Enable shuttle discovery with a list of validated addresses
    pub fn enable_shuttle_discovery(&mut self, addresses: Vec<String>) {
        self.0.store_setting_mut().discovery = warp_ipfs::config::Discovery::Shuttle {
            addresses: addresses
                .into_iter()
                .filter_map(|addr| FromStr::from_str(&addr).ok()) // Validate each address
                .collect(),
        };
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
