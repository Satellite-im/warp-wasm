use crate::warp::stream::AsyncIterator;
use futures::StreamExt;
use indexmap::IndexMap;
use js_sys::Map;
use macro_utils::FromTo;
use serde::{Deserialize, Serialize};
use std::str::FromStr;
use tsify_next::Tsify;
use warp::error::Error;
use warp::multipass::identity::ShortId;
use warp::multipass::{
    Friends, IdentityImportOption, IdentityInformation, LocalIdentity, MultiPassEvent,
    MultiPassImportExport,
};
use warp::warp::dummy::Dummy;
use warp::warp::Warp;
use warp::{
    crypto::DID,
    multipass::{
        self,
        identity::{self},
        MultiPass,
    },
};
use warp_ipfs::{WarpIpfs, WarpIpfsInstance};
use wasm_bindgen::prelude::*;

use super::constellation::FileType;

#[derive(Clone)]
#[wasm_bindgen]
pub struct MultiPassBox {
    inner: Warp<WarpIpfs, Dummy, Dummy>,
}
impl MultiPassBox {
    pub fn new(instance: &WarpIpfsInstance) -> Self {
        Self {
            inner: instance.clone().split_multipass(),
        }
    }
}

/// impl MultiPass trait
#[wasm_bindgen]
impl MultiPassBox {
    pub async fn create_identity(
        &mut self,
        username: Option<String>,
        passphrase: Option<String>,
    ) -> Result<IdentityProfile, JsError> {
        self.inner
            .create_identity(username.as_deref(), passphrase.as_deref())
            .await
            .map_err(|e| e.into())
            .map(|i| i.into())
    }

    pub async fn get_identity(&self, identifier: Identifier) -> Result<Vec<Identity>, JsError> {
        let id = identifier.into();
        let single_id = matches!(id, warp::multipass::identity::Identifier::DID(_));
        let list = self
            .inner
            .get_identity(id.clone())
            .collect::<Vec<_>>()
            .await;
        match (single_id, list.is_empty()) {
            (true, true) => Err(Error::IdentityDoesntExist.into()),
            (_, false) | (_, true) => Ok(list.into_iter().map(|i| i.into()).collect()),
        }
    }

    pub async fn identity(&self) -> Result<Identity, JsError> {
        self.inner
            .identity()
            .await
            .map_err(|e| e.into())
            .map(|i| i.into())
    }

    pub fn tesseract(&self) -> crate::warp::tesseract::Tesseract {
        self.inner.tesseract().into()
    }

    pub async fn update_identity(&mut self, update: IdentityUpdate) -> Result<(), JsError> {
        self.inner
            .update_identity(update.into())
            .await
            .map_err(|e| e.into())
    }
}

/// impl MultiPassEvent trait
#[wasm_bindgen]
impl MultiPassBox {
    /// Subscribe to multipass events returning a stream of multipass events
    /// The result is of type {@link MultiPassEventKind}
    pub async fn multipass_subscribe(&mut self) -> Result<AsyncIterator, JsError> {
        self.inner
            .multipass_subscribe()
            .await
            .map_err(|e| e.into())
            .map(|s| {
                AsyncIterator::new(Box::pin(s.map(|t| {
                    serde_wasm_bindgen::to_value(&Into::<MultiPassEventKind>::into(t)).unwrap()
                })))
            })
    }
}

/// impl MultiPassImportExport trait
#[wasm_bindgen]
impl MultiPassBox {
    /// Import identity from a specific location
    /// If a buffer is provided will import from that buffer. Otherwise will try to import from remote
    pub async fn import_identity(
        &mut self,
        passphrase: String,
        from: Option<Vec<u8>>,
    ) -> Result<Identity, JsError> {
        let mut to = from.clone();
        let loc: multipass::ImportLocation = match to.as_mut() {
            Some(buffer) => multipass::ImportLocation::Memory { buffer },
            None => multipass::ImportLocation::Remote,
        };
        self.inner
            .import_identity(IdentityImportOption::Locate {
                location: loc,
                passphrase,
            })
            .await
            .map_err(|e| e.into())
            .map(|i| i.into())
    }

    /// Manually export identity to a specific location
    /// If exporting to memory will return the memory buffer for it
    pub async fn export_identity(
        &mut self,
        memory: Option<bool>,
    ) -> Result<Option<Vec<u8>>, JsError> {
        let mut buffer: Option<Vec<u8>> = if memory.unwrap_or_default() {
            Some(vec![])
        } else {
            None
        };
        let loc: multipass::ImportLocation = match buffer.as_mut() {
            Some(buffer) => multipass::ImportLocation::Memory { buffer },
            None => multipass::ImportLocation::Remote,
        };
        self.inner
            .export_identity(loc)
            .await
            .map(|_| buffer)
            .map_err(|e| e.into())
    }
}

/// impl Friends trait
#[wasm_bindgen]
impl MultiPassBox {
    /// Send friend request to corresponding public key
    pub async fn send_request(&mut self, pubkey: String) -> Result<(), JsError> {
        self.inner
            .send_request(&DID::from_str(&pubkey).unwrap_or_default())
            .await
            .map_err(|e| e.into())
    }

    /// Accept friend request from public key
    pub async fn accept_request(&mut self, pubkey: String) -> Result<(), JsError> {
        self.inner
            .accept_request(&DID::from_str(&pubkey).unwrap_or_default())
            .await
            .map_err(|e| e.into())
    }

    /// Deny friend request from public key
    pub async fn deny_request(&mut self, pubkey: String) -> Result<(), JsError> {
        self.inner
            .deny_request(&DID::from_str(&pubkey).unwrap_or_default())
            .await
            .map_err(|e| e.into())
    }

    /// Closing or retracting friend request
    pub async fn close_request(&mut self, pubkey: String) -> Result<(), JsError> {
        self.inner
            .close_request(&DID::from_str(&pubkey).unwrap_or_default())
            .await
            .map_err(|e| e.into())
    }

    /// Check to determine if a request been received from the DID
    pub async fn received_friend_request_from(&self, pubkey: String) -> Result<bool, JsError> {
        self.inner
            .received_friend_request_from(&DID::from_str(&pubkey).unwrap_or_default())
            .await
            .map_err(|e| e.into())
    }

    /// List the incoming friend request
    pub async fn list_incoming_request(&self) -> Result<Vec<FriendRequest>, JsError> {
        self.inner
            .list_incoming_request()
            .await
            .map_err(|e| e.into())
            .map(|ok| ok.into_iter().map(|r| r.into()).collect())
    }

    /// Check to determine if a request been sent to the DID
    pub async fn sent_friend_request_to(&self, pubkey: String) -> Result<bool, JsError> {
        self.inner
            .sent_friend_request_to(&DID::from_str(&pubkey).unwrap_or_default())
            .await
            .map_err(|e| e.into())
    }

    /// List the outgoing friend request
    pub async fn list_outgoing_request(&self) -> Result<Vec<FriendRequest>, JsError> {
        self.inner
            .list_outgoing_request()
            .await
            .map_err(|e| e.into())
            .map(|ok| ok.into_iter().map(|r| r.into()).collect())
    }

    /// Remove friend from contacts
    pub async fn remove_friend(&mut self, pubkey: String) -> Result<(), JsError> {
        self.inner
            .remove_friend(&DID::from_str(&pubkey).unwrap_or_default())
            .await
            .map_err(|e| e.into())
    }

    /// Block public key, rather it be a friend or not, from being able to send request to account public address
    pub async fn block(&mut self, pubkey: String) -> Result<(), JsError> {
        self.inner
            .block(&DID::from_str(&pubkey).unwrap_or_default())
            .await
            .map_err(|e| e.into())
    }

    /// Unblock public key
    pub async fn unblock(&mut self, pubkey: String) -> Result<(), JsError> {
        self.inner
            .unblock(&DID::from_str(&pubkey).unwrap_or_default())
            .await
            .map_err(|e| e.into())
    }

    /// List block list
    pub async fn block_list(&self) -> Result<Vec<String>, JsError> {
        self.inner
            .block_list()
            .await
            .map_err(|e| e.into())
            .map(|ok| ok.iter().map(|i| i.to_string()).collect::<Vec<String>>())
    }

    /// Check to see if public key is blocked
    pub async fn is_blocked(&self, pubkey: String) -> Result<bool, JsError> {
        self.inner
            .is_blocked(&DID::from_str(&pubkey).unwrap_or_default())
            .await
            .map_err(|e| e.into())
    }

    /// List all friends public key
    pub async fn list_friends(&self) -> Result<Vec<String>, JsError> {
        self.inner
            .list_friends()
            .await
            .map_err(|e| e.into())
            .map(|ok| ok.iter().map(|i| i.to_string()).collect::<Vec<String>>())
    }

    /// Check to see if public key is friend of the account
    pub async fn has_friend(&self, pubkey: String) -> Result<bool, JsError> {
        self.inner
            .has_friend(&DID::from_str(&pubkey).unwrap_or_default())
            .await
            .map_err(|e| e.into())
    }
}

/// impl IdentityInformation trait
#[wasm_bindgen]
impl MultiPassBox {
    /// Profile picture belonging to the `Identity`
    pub async fn identity_picture(&self, did: String) -> Result<IdentityImage, JsError> {
        self.inner
            .identity_picture(&DID::from_str(&did).unwrap_or_default())
            .await
            .map_err(|e| e.into())
            .map(|i| i.into())
    }

    /// Profile banner belonging to the `Identity`
    pub async fn identity_banner(&self, did: String) -> Result<IdentityImage, JsError> {
        self.inner
            .identity_banner(&DID::from_str(&did).unwrap_or_default())
            .await
            .map_err(|e| e.into())
            .map(|i| i.into())
    }

    /// Identity status to determine if they are online or offline
    pub async fn identity_status(&self, did: String) -> Result<IdentityStatus, JsError> {
        self.inner
            .identity_status(&DID::from_str(&did).unwrap_or_default())
            .await
            .map_err(|e| e.into())
            .map(|i| i.into())
    }

    /// Identity status to determine if they are online or offline
    pub async fn set_identity_status(&mut self, status: IdentityStatus) -> Result<(), JsError> {
        self.inner
            .set_identity_status(status.into())
            .await
            .map_err(|e| e.into())
    }

    /// Find the relationship with an existing identity.
    pub async fn identity_relationship(&self, did: String) -> Result<Relationship, JsError> {
        self.inner
            .identity_relationship(&DID::from_str(&did).unwrap_or_default())
            .await
            .map_err(|e| e.into())
            .map(|r| r.into())
    }

    /// Returns the identity platform while online.
    pub async fn identity_platform(&self, did: String) -> Result<Platform, JsError> {
        self.inner
            .identity_platform(&DID::from_str(&did).unwrap_or_default())
            .await
            .map_err(|e| e.into())
            .map(|p| p.into())
    }
}

#[derive(Tsify, Deserialize, Serialize, FromTo)]
#[from_to(identity::IdentityUpdate, only = "into")]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum IdentityUpdate {
    Username(String),
    Picture(Vec<u8>),
    PicturePath(std::path::PathBuf),
    // PictureStream(BoxStream<'static, Result<Vec<u8>, std::io::Error>>),
    AddMetadataKey { key: String, value: String },
    RemoveMetadataKey { key: String },
    ClearPicture,
    Banner(Vec<u8>),
    BannerPath(std::path::PathBuf),
    // BannerStream(BoxStream<'static, Result<Vec<u8>, std::io::Error>>),
    ClearBanner,
    StatusMessage(Option<String>),
    ClearStatusMessage,
}

#[derive(Tsify, Deserialize, Serialize, FromTo)]
#[from_to(identity::Identifier, only = "into")]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum Identifier {
    DID(#[from_to(from = "DID::from_str(&f_0).unwrap()")] String),
    DIDList(#[from_to(from = "to_did_vec")] Vec<String>),
    Username(String),
}

fn to_did_vec(dids: Vec<String>) -> Vec<DID> {
    dids.into_iter()
        .map(|did| DID::from_str(&did).unwrap())
        .collect()
}

#[wasm_bindgen]
#[derive(FromTo)]
#[from_to(multipass::identity::FriendRequest, only = "from")]
pub struct FriendRequest {
    #[wasm_bindgen(readonly, getter_with_clone)]
    #[from_to(from = "{value}.identity().to_string()")]
    pub identity: String,
    #[wasm_bindgen(readonly, getter_with_clone)]
    #[from_to(from = "{value}.date().into()")]
    pub date: js_sys::Date,
}

#[derive(Tsify, Serialize, Deserialize, FromTo)]
#[from_to(multipass::MultiPassEventKind, only = "from")]
pub enum MultiPassEventKind {
    FriendRequestReceived {
        from: String,
        #[serde(with = "serde_wasm_bindgen::preserve")]
        date: js_sys::Date,
    },
    FriendRequestSent {
        to: String,
        #[serde(with = "serde_wasm_bindgen::preserve")]
        date: js_sys::Date,
    },
    IncomingFriendRequestRejected {
        did: String,
    },
    OutgoingFriendRequestRejected {
        did: String,
    },
    IncomingFriendRequestClosed {
        did: String,
    },
    OutgoingFriendRequestClosed {
        did: String,
    },
    FriendAdded {
        did: String,
    },
    FriendRemoved {
        did: String,
    },
    IdentityOnline {
        did: String,
    },
    IdentityOffline {
        did: String,
    },
    IdentityUpdate {
        did: String,
    },
    Blocked {
        did: String,
    },
    BlockedBy {
        did: String,
    },
    Unblocked {
        did: String,
    },
    UnblockedBy {
        did: String,
    },
}

#[wasm_bindgen]
#[derive(FromTo)]
#[from_to(warp::multipass::identity::IdentityImage, only = "from")]
pub struct IdentityImage {
    #[wasm_bindgen(readonly, getter_with_clone)]
    #[from_to(from = "{value}.data().to_vec()")]
    pub data: Vec<u8>,
    #[wasm_bindgen(readonly, getter_with_clone)]
    #[from_to(from = "{value}.image_type().clone().into()")]
    pub image_type: FileType,
}

#[wasm_bindgen]
pub struct Identity(warp::multipass::identity::Identity);

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(typescript_type = "Map<string,string>")]
    pub type MetaData;
}

#[wasm_bindgen]
impl Identity {
    pub fn username(&self) -> String {
        self.0.username().to_string()
    }
    pub fn status_message(&self) -> Option<String> {
        self.0.status_message().map(|s| s.to_string())
    }
    pub fn short_id(&self) -> String {
        format!("{}", self.0.short_id())
    }
    pub fn did_key(&self) -> String {
        format!("{}", self.0.did_key())
    }
    pub fn created(&self) -> js_sys::Date {
        self.0.created().into()
    }
    pub fn modified(&self) -> js_sys::Date {
        self.0.modified().into()
    }
    pub fn metadata(&self) -> MetaData {
        MetaData::from(serde_wasm_bindgen::to_value(&self.0.metadata()).unwrap())
    }
}
#[wasm_bindgen]
impl Identity {
    pub fn set_username(&mut self, user: String) {
        self.0.set_username(&user);
    }
    pub fn set_status_message(&mut self, message: Option<String>) {
        self.0.set_status_message(message);
    }
    pub fn set_short_id(&mut self, id: String) {
        self.0.set_short_id::<ShortId>(id.try_into().unwrap());
    }
    pub fn set_did_key(&mut self, pubkey: String) {
        self.0.set_did_key(DID::from_str(pubkey.as_str()).unwrap());
    }
    pub fn set_created(&mut self, time: js_sys::Date) {
        self.0.set_created(time.into());
    }
    pub fn set_modified(&mut self, time: js_sys::Date) {
        self.0.set_modified(time.into());
    }
    pub fn set_metadata(&mut self, map: MetaData) {
        let mut index_map = IndexMap::new();
        let map: Map = map.obj.into();
        map.for_each(&mut |key, value| {
            if key.is_string() && value.is_string() {
                index_map.insert(key.as_string().unwrap(), value.as_string().unwrap());
            }
        });
        self.0.set_metadata(index_map);
    }
}

impl From<warp::multipass::identity::Identity> for Identity {
    fn from(value: warp::multipass::identity::Identity) -> Self {
        Identity(value)
    }
}

#[wasm_bindgen]
#[derive(FromTo)]
#[from_to(warp::multipass::identity::Relationship, only = "from")]
pub struct Relationship {
    #[from_to(from = "{value}.friends()")]
    pub friends: bool,
    #[from_to(from = "{value}.received_friend_request()")]
    pub received_friend_request: bool,
    #[from_to(from = "{value}.sent_friend_request()")]
    pub sent_friend_request: bool,
    #[from_to(from = "{value}.blocked()")]
    pub blocked: bool,
    #[from_to(from = "{value}.blocked_by()")]
    pub blocked_by: bool,
}

#[wasm_bindgen]
pub struct IdentityProfile(warp::multipass::identity::IdentityProfile);

#[wasm_bindgen]
impl IdentityProfile {
    pub fn identity(&self) -> Identity {
        Identity(self.0.identity().clone())
    }
    pub fn passphrase(&self) -> Option<String> {
        self.0.passphrase().map(|s| s.to_string())
    }
}

impl From<warp::multipass::identity::IdentityProfile> for IdentityProfile {
    fn from(value: warp::multipass::identity::IdentityProfile) -> Self {
        IdentityProfile(value)
    }
}

#[wasm_bindgen]
#[derive(FromTo)]
#[from_to(warp::multipass::identity::Platform)]
pub enum Platform {
    Desktop,
    Mobile,
    Web,
    Unknown,
}

#[wasm_bindgen]
#[derive(FromTo)]
#[from_to(warp::multipass::identity::IdentityStatus)]
pub enum IdentityStatus {
    Online,
    Away,
    Busy,
    Offline,
}

#[wasm_bindgen]
pub fn generate_name() -> String {
    warp::multipass::generator::generate_name()
}
