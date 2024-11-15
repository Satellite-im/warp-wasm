use crate::warp::stream::AsyncIterator;
use futures::StreamExt;
use indexmap::IndexMap;
use js_sys::Map;
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
    pub async fn multipass_subscribe(&mut self) -> Result<AsyncIterator, JsError> {
        self.inner
            .multipass_subscribe()
            .await
            .map_err(|e| e.into())
            .map(|s| {
                AsyncIterator::new(Box::pin(
                    s.map(|t| Into::<MultiPassEventKind>::into(t).into()),
                ))
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
        mut to: Option<Vec<u8>>,
    ) -> Result<Identity, JsError> {
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
    pub async fn export_identity(&mut self, memory: Option<bool>) -> Result<Option<Vec<u8>>, JsError> {
        let mut buffer: Option<Vec<u8>> = if memory.unwrap_or_default() { Some(vec![]) } else { None };
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
            .map(|i| IdentityImage(i))
    }

    /// Profile banner belonging to the `Identity`
    pub async fn identity_banner(&self, did: String) -> Result<IdentityImage, JsError> {
        self.inner
            .identity_banner(&DID::from_str(&did).unwrap_or_default())
            .await
            .map_err(|e| e.into())
            .map(|i| IdentityImage(i))
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

#[derive(Tsify, Deserialize, Serialize)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum IdentityUpdate {
    Username(String),
    Picture(Vec<u8>),
    PicturePath(std::path::PathBuf),
    // PictureStream(BoxStream<'static, Result<Vec<u8>, std::io::Error>>),
    AddMetadataKey { key: String, value: String },
    RemoveMetadataKey(String),
    ClearPicture,
    Banner(Vec<u8>),
    BannerPath(std::path::PathBuf),
    // BannerStream(BoxStream<'static, Result<Vec<u8>, std::io::Error>>),
    ClearBanner,
    StatusMessage(Option<String>),
    ClearStatusMessage,
}

impl Into<identity::IdentityUpdate> for IdentityUpdate {
    fn into(self) -> identity::IdentityUpdate {
        match self {
            IdentityUpdate::Username(name) => identity::IdentityUpdate::Username(name),
            IdentityUpdate::Picture(data) => identity::IdentityUpdate::Picture(data),
            IdentityUpdate::PicturePath(path) => identity::IdentityUpdate::PicturePath(path),
            // IdentityUpdate::PictureStream => Ok(identity::IdentityUpdate::PictureStream(
            //     value.into()
            // )),
            IdentityUpdate::ClearPicture => identity::IdentityUpdate::ClearPicture,
            IdentityUpdate::Banner(data) => identity::IdentityUpdate::Banner(data),
            IdentityUpdate::BannerPath(path) => identity::IdentityUpdate::BannerPath(path),
            // // IdentityUpdate::BannerStream => Ok(identity::IdentityUpdate::BannerStream(
            // //     value.into()
            // // )),
            IdentityUpdate::ClearBanner => identity::IdentityUpdate::ClearBanner,
            IdentityUpdate::StatusMessage(value) => identity::IdentityUpdate::StatusMessage(value),
            IdentityUpdate::ClearStatusMessage => identity::IdentityUpdate::ClearStatusMessage,
            IdentityUpdate::AddMetadataKey { key, value } => {
                identity::IdentityUpdate::AddMetadataKey { key, value }
            }
            IdentityUpdate::RemoveMetadataKey(key) => {
                identity::IdentityUpdate::RemoveMetadataKey { key }
            }
        }
    }
}

#[derive(Tsify, Deserialize, Serialize)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum Identifier {
    DID(String),
    DIDList(Vec<String>),
    Username(String),
}

impl Into<identity::Identifier> for Identifier {
    fn into(self) -> identity::Identifier {
        match self {
            Identifier::DID(did) => identity::Identifier::DID(DID::from_str(&did).unwrap()),
            Identifier::DIDList(vec) => identity::Identifier::DIDList(
                vec.into_iter()
                    .map(|did| DID::from_str(&did).unwrap())
                    .collect(),
            ),
            Identifier::Username(name) => identity::Identifier::Username(name),
        }
    }
}

#[wasm_bindgen]
pub struct FriendRequest {
    identity: String,
    date: js_sys::Date,
}

#[wasm_bindgen]
impl FriendRequest {
    #[wasm_bindgen(getter)]
    pub fn identity(&self) -> String {
        self.identity.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn date(&self) -> js_sys::Date {
        self.date.clone()
    }
}

impl From<multipass::identity::FriendRequest> for FriendRequest {
    fn from(value: multipass::identity::FriendRequest) -> Self {
        FriendRequest {
            identity: value.identity().to_string(),
            date: value.date().into(),
        }
    }
}

#[wasm_bindgen]
pub struct MultiPassEventKind {
    kind: MultiPassEventKindEnum,
    did: String,
}

#[wasm_bindgen]
impl MultiPassEventKind {
    #[wasm_bindgen(getter)]
    pub fn kind(&self) -> MultiPassEventKindEnum {
        self.kind
    }
    #[wasm_bindgen(getter)]
    pub fn did(&self) -> String {
        self.did.clone()
    }
}

impl From<multipass::MultiPassEventKind> for MultiPassEventKind {
    fn from(value: multipass::MultiPassEventKind) -> Self {
        match value {
            multipass::MultiPassEventKind::FriendRequestReceived { from, .. } => {
                MultiPassEventKind {
                    kind: MultiPassEventKindEnum::FriendRequestReceived,
                    did: from.to_string(),
                }
            }
            multipass::MultiPassEventKind::FriendRequestSent { to, .. } => MultiPassEventKind {
                kind: MultiPassEventKindEnum::FriendRequestSent,
                did: to.to_string(),
            },
            multipass::MultiPassEventKind::IncomingFriendRequestRejected { did } => {
                MultiPassEventKind {
                    kind: MultiPassEventKindEnum::IncomingFriendRequestRejected,
                    did: did.to_string(),
                }
            }
            multipass::MultiPassEventKind::OutgoingFriendRequestRejected { did } => {
                MultiPassEventKind {
                    kind: MultiPassEventKindEnum::OutgoingFriendRequestRejected,
                    did: did.to_string(),
                }
            }
            multipass::MultiPassEventKind::IncomingFriendRequestClosed { did } => {
                MultiPassEventKind {
                    kind: MultiPassEventKindEnum::IncomingFriendRequestClosed,
                    did: did.to_string(),
                }
            }
            multipass::MultiPassEventKind::OutgoingFriendRequestClosed { did } => {
                MultiPassEventKind {
                    kind: MultiPassEventKindEnum::OutgoingFriendRequestClosed,
                    did: did.to_string(),
                }
            }
            multipass::MultiPassEventKind::FriendAdded { did } => MultiPassEventKind {
                kind: MultiPassEventKindEnum::FriendAdded,
                did: did.to_string(),
            },
            multipass::MultiPassEventKind::FriendRemoved { did } => MultiPassEventKind {
                kind: MultiPassEventKindEnum::FriendRemoved,
                did: did.to_string(),
            },
            multipass::MultiPassEventKind::IdentityOnline { did } => MultiPassEventKind {
                kind: MultiPassEventKindEnum::IdentityOnline,
                did: did.to_string(),
            },
            multipass::MultiPassEventKind::IdentityOffline { did } => MultiPassEventKind {
                kind: MultiPassEventKindEnum::IdentityOffline,
                did: did.to_string(),
            },
            multipass::MultiPassEventKind::IdentityUpdate { did } => MultiPassEventKind {
                kind: MultiPassEventKindEnum::IdentityUpdate,
                did: did.to_string(),
            },
            multipass::MultiPassEventKind::Blocked { did } => MultiPassEventKind {
                kind: MultiPassEventKindEnum::Blocked,
                did: did.to_string(),
            },
            multipass::MultiPassEventKind::BlockedBy { did } => MultiPassEventKind {
                kind: MultiPassEventKindEnum::BlockedBy,
                did: did.to_string(),
            },
            multipass::MultiPassEventKind::Unblocked { did } => MultiPassEventKind {
                kind: MultiPassEventKindEnum::Unblocked,
                did: did.to_string(),
            },
            multipass::MultiPassEventKind::UnblockedBy { did } => MultiPassEventKind {
                kind: MultiPassEventKindEnum::UnblockedBy,
                did: did.to_string(),
            },
        }
    }
}

#[derive(Copy, Clone)]
#[wasm_bindgen]
pub enum MultiPassEventKindEnum {
    FriendRequestReceived,
    FriendRequestSent,
    IncomingFriendRequestRejected,
    OutgoingFriendRequestRejected,
    IncomingFriendRequestClosed,
    OutgoingFriendRequestClosed,
    FriendAdded,
    FriendRemoved,
    IdentityOnline,
    IdentityOffline,
    IdentityUpdate,
    Blocked,
    BlockedBy,
    Unblocked,
    UnblockedBy,
}

#[wasm_bindgen]
pub struct IdentityImage(identity::IdentityImage);

#[wasm_bindgen]
impl IdentityImage {
    pub fn data(&self) -> Vec<u8> {
        self.0.data().to_vec()
    }

    pub fn image_type(&self) -> FileType {
        self.0.image_type().into()
    }
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
        self.0.username()
    }
    pub fn status_message(&self) -> Option<String> {
        self.0.status_message()
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
pub struct Relationship(warp::multipass::identity::Relationship);

#[wasm_bindgen]
impl Relationship {
    pub fn friends(&self) -> bool {
        self.0.friends()
    }
    pub fn received_friend_request(&self) -> bool {
        self.0.received_friend_request()
    }
    pub fn sent_friend_request(&self) -> bool {
        self.0.sent_friend_request()
    }
    pub fn blocked(&self) -> bool {
        self.0.blocked()
    }
    pub fn blocked_by(&self) -> bool {
        self.0.blocked_by()
    }
}

impl From<warp::multipass::identity::Relationship> for Relationship {
    fn from(value: warp::multipass::identity::Relationship) -> Self {
        Relationship(value)
    }
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
pub enum Platform {
    Desktop,
    Mobile,
    Web,
    Unknown,
}

impl From<warp::multipass::identity::Platform> for Platform {
    fn from(value: warp::multipass::identity::Platform) -> Self {
        match value {
            identity::Platform::Desktop => Platform::Desktop,
            identity::Platform::Mobile => Platform::Mobile,
            identity::Platform::Web => Platform::Web,
            identity::Platform::Unknown => Platform::Unknown,
        }
    }
}

#[wasm_bindgen]
pub enum IdentityStatus {
    Online,
    Away,
    Busy,
    Offline,
}

impl From<warp::multipass::identity::IdentityStatus> for IdentityStatus {
    fn from(value: warp::multipass::identity::IdentityStatus) -> Self {
        match value {
            identity::IdentityStatus::Online => IdentityStatus::Online,
            identity::IdentityStatus::Away => IdentityStatus::Away,
            identity::IdentityStatus::Busy => IdentityStatus::Busy,
            identity::IdentityStatus::Offline => IdentityStatus::Offline,
        }
    }
}

impl From<IdentityStatus> for warp::multipass::identity::IdentityStatus {
    fn from(value: IdentityStatus) -> Self {
        match value {
            IdentityStatus::Online => identity::IdentityStatus::Online,
            IdentityStatus::Away => identity::IdentityStatus::Away,
            IdentityStatus::Busy => identity::IdentityStatus::Busy,
            IdentityStatus::Offline => identity::IdentityStatus::Offline,
        }
    }
}

#[wasm_bindgen]
pub fn generate_name() -> String {
    warp::multipass::generator::generate_name()
}
