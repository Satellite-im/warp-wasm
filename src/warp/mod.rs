use warp::constellation::Constellation;
use warp::multipass::MultiPass;
use warp::raygun::RayGun;
use warp_ipfs::WarpIpfsInstance;
use constellation::ConstellationBox;
use multipass::MultiPassBox;
use raygun::RayGunBox;

use wasm_bindgen::prelude::*;

pub mod constellation;
pub mod multipass;
pub mod raygun;
pub mod stream;
pub mod tesseract;

#[wasm_bindgen(start)]
pub fn initialize() {
    std::panic::set_hook(Box::new(console_error_panic_hook::hook));
}

#[wasm_bindgen]
pub fn trace() {
    tracing_wasm::set_as_global_default();
}

#[wasm_bindgen]
pub struct WarpInstance {
    multipass: MultiPassBox,
    raygun: RayGunBox,
    constellation: ConstellationBox,
}

impl WarpInstance {
    pub fn new(instance: WarpIpfsInstance) -> Self {

        let multipass = MultiPassBox::new(&instance);
        let raygun = RayGunBox::new(&instance);
        let constellation = ConstellationBox::new(&instance);

        Self {
            multipass,
            raygun,
            constellation,
        }
    }
}
#[wasm_bindgen]
impl WarpInstance {
    #[wasm_bindgen(getter)]
    pub fn multipass(&self) -> MultiPassBox {
        self.multipass.clone()
    }
    #[wasm_bindgen(getter)]
    pub fn raygun(&self) -> RayGunBox {
        self.raygun.clone()
    }
    #[wasm_bindgen(getter)]
    pub fn constellation(&self) -> ConstellationBox {
        self.constellation.clone()
    }
}
