use warp::error::Error;
use warp::multipass::identity::ShortId;
use warp::{
    crypto::DID,
    multipass::{
        self,
        identity::{
            self,
        },
        MultiPass,
    }
};
use crate::warp::stream::AsyncIterator;
use futures::StreamExt;
use js_sys::{Array, Map, Uint8Array};
use std::str::FromStr;
use wasm_bindgen::prelude::*;
use indexmap::IndexMap;
use warp::multipass::{Friends, IdentityInformation, LocalIdentity, MultiPassEvent};
use warp::warp::dummy::Dummy;
use warp::warp::Warp;
use warp_ipfs::{WarpIpfs, WarpIpfsInstance};

#[derive(Clone)]
#[wasm_bindgen]
pub struct MultiPassBox {
    inner: Warp<WarpIpfs, Dummy, Dummy>,
}
impl MultiPassBox {
    pub fn new(instance: &WarpIpfsInstance) -> Self {
        Self { inner: instance.clone().split_multipass() }
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
            .map(|i|i.into())
    }

    pub async fn get_identity(
        &self,
        id_variant: Identifier,
        id_value: JsValue,
    ) -> Result<JsValue, JsError> {
        let id = to_identifier_enum(id_variant, id_value)?;
        let single_id = matches!(id, warp::multipass::identity::Identifier::DID(_));
        let list = self
            .inner
            .get_identity(id.clone())
            .collect::<Vec<_>>()
            .await;
        match (single_id, list.is_empty()) {
            (true, true) => Err(Error::IdentityDoesntExist.into()),
            (_, false) | (_, true) => Ok(serde_wasm_bindgen::to_value(&list).unwrap()),
        }
    }

    pub async fn identity(&self) -> Result<Identity, JsError> {
        self.inner.identity().await.map_err(|e| e.into()).map(|i|i.into())
    }

    pub fn tesseract(&self) -> crate::warp::tesseract::Tesseract {
        self.inner.tesseract().into()
    }

    pub async fn update_identity(
        &mut self,
        option: IdentityUpdate,
        value: JsValue,
    ) -> Result<(), JsError> {
        self.inner
            .update_identity(to_identity_update_enum(option, value)?)
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
    pub async fn list_incoming_request(&self) -> Result<JsValue, JsError> {
        self.inner
            .list_incoming_request()
            .await
            .map_err(|e| e.into())
            .map(|ok| serde_wasm_bindgen::to_value(&ok).unwrap())
    }

    /// Check to determine if a request been sent to the DID
    pub async fn sent_friend_request_to(&self, pubkey: String) -> Result<bool, JsError> {
        self.inner
            .sent_friend_request_to(&DID::from_str(&pubkey).unwrap_or_default())
            .await
            .map_err(|e| e.into())
    }

    /// List the outgoing friend request
    pub async fn list_outgoing_request(&self) -> Result<JsValue, JsError> {
        self.inner
            .list_outgoing_request()
            .await
            .map_err(|e| e.into())
            .map(|ok| serde_wasm_bindgen::to_value(&ok).unwrap())
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
    pub async fn block_list(&self) -> Result<JsValue, JsError> {
        self.inner
            .block_list()
            .await
            .map_err(|e| e.into())
            .map(|ok| {
                serde_wasm_bindgen::to_value(
                    &ok.iter().map(|i| i.to_string()).collect::<Vec<String>>(),
                )
                .unwrap()
            })
    }

    /// Check to see if public key is blocked
    pub async fn is_blocked(&self, pubkey: String) -> Result<bool, JsError> {
        self.inner
            .is_blocked(&DID::from_str(&pubkey).unwrap_or_default())
            .await
            .map_err(|e| e.into())
    }

    /// List all friends public key
    pub async fn list_friends(&self) -> Result<JsValue, JsError> {
        self.inner
            .list_friends()
            .await
            .map_err(|e| e.into())
            .map(|ok| {
                serde_wasm_bindgen::to_value(
                    &ok.iter().map(|i| i.to_string()).collect::<Vec<String>>(),
                )
                .unwrap()
            })
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
    pub async fn identity_picture(
        &self,
        did: String,
    ) -> Result<IdentityImage, JsError> {
        self.inner
            .identity_picture(&DID::from_str(&did).unwrap_or_default())
            .await
            .map_err(|e| e.into())
            .map(|i |IdentityImage(i))
    }

    /// Profile banner belonging to the `Identity`
    pub async fn identity_banner(&self, did: String) -> Result<IdentityImage, JsError> {
        self.inner
            .identity_banner(&DID::from_str(&did).unwrap_or_default())
            .await
            .map_err(|e| e.into())
            .map(|i |IdentityImage(i))
    }

    /// Identity status to determine if they are online or offline
    pub async fn identity_status(&self, did: String) -> Result<IdentityStatus, JsError> {
        self.inner
            .identity_status(&DID::from_str(&did).unwrap_or_default())
            .await
            .map_err(|e| e.into())
            .map(|i|i.into())
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
            .map(|r|r.into())
    }

    /// Returns the identity platform while online.
    pub async fn identity_platform(&self, did: String) -> Result<Platform, JsError> {
        self.inner
            .identity_platform(&DID::from_str(&did).unwrap_or_default())
            .await
            .map_err(|e| e.into())
            .map(|p|p.into())
    }
}

#[wasm_bindgen]
pub enum IdentityUpdate {
    Username,
    Picture,
    PicturePath,
    PictureStream,
    ClearPicture,
    Banner,
    BannerPath,
    BannerStream,
    ClearBanner,
    StatusMessage,
    ClearStatusMessage,
    AddMetadataKey,
    RemoveMetadataKey,
}

fn to_identity_update_enum(
    option: IdentityUpdate,
    value: JsValue,
) -> Result<identity::IdentityUpdate, JsError> {
    match option {
        IdentityUpdate::Username => match value.as_string() {
            Some(s) => Ok(identity::IdentityUpdate::Username(s)),
            None => Err(JsError::new("JsValue is not a string")),
        },
        IdentityUpdate::Picture => Ok(identity::IdentityUpdate::Picture(
            Uint8Array::new(&value).to_vec(),
        )),
        IdentityUpdate::PicturePath => Ok(identity::IdentityUpdate::PicturePath(
            value
                .as_string()
                .ok_or(JsError::new("JsValue is not a string"))?
                .into(),
        )),
        // IdentityUpdate::PictureStream => Ok(identity::IdentityUpdate::PictureStream(
        //     value.into()
        // )),
        IdentityUpdate::ClearPicture => Ok(identity::IdentityUpdate::ClearPicture),
        IdentityUpdate::Banner => Ok(identity::IdentityUpdate::Banner(
            Uint8Array::new(&value).to_vec(),
        )),
        IdentityUpdate::BannerPath => Ok(identity::IdentityUpdate::BannerPath(
            value
                .as_string()
                .ok_or(JsError::new("JsValue is not a string"))?
                .into(),
        )),
        // IdentityUpdate::BannerStream => Ok(identity::IdentityUpdate::BannerStream(
        //     value.into()
        // )),
        IdentityUpdate::ClearBanner => Ok(identity::IdentityUpdate::ClearBanner),
        IdentityUpdate::StatusMessage => {
            if value.is_null() {
                return Ok(identity::IdentityUpdate::StatusMessage(None));
            }
            match value.as_string() {
                Some(s) => Ok(identity::IdentityUpdate::StatusMessage(Some(s))),
                None => Err(JsError::new("JsValue is not a string")),
            }
        }
        IdentityUpdate::ClearStatusMessage => Ok(identity::IdentityUpdate::ClearStatusMessage),
        IdentityUpdate::AddMetadataKey => {
            let array: Array = value
                .dyn_into()
                .map_err(|_| JsError::new("key, value should be in an array"))?;
            let key = array
                .get(0)
                .as_string()
                .ok_or(JsError::new("key should be a string"))?;
            let value = array
                .get(1)
                .as_string()
                .ok_or(JsError::new("value should be a string"))?;
            Ok(identity::IdentityUpdate::AddMetadataKey { key, value })
        }
        IdentityUpdate::RemoveMetadataKey => Ok(identity::IdentityUpdate::RemoveMetadataKey {
            key: value
                .as_string()
                .ok_or(JsError::new("JsValue is not a string"))?
                .into(),
        }),
        _ => Err(JsError::new("IdentityUpdate variant not yet implemented")),
    }
}

#[wasm_bindgen]
pub enum Identifier {
    DID,
    DIDList,
    Username,
}
fn to_identifier_enum(option: Identifier, value: JsValue) -> Result<identity::Identifier, JsError> {
    match option {
        Identifier::DID => match value.as_string() {
            Some(did) => Ok(identity::Identifier::DID(DID::from_str(did.as_str())?)),
            None => Err(JsError::new("JsValue is not a string")),
        },
        Identifier::DIDList => {
            let iterator = match js_sys::try_iter(&value) {
                Err(e) => Err(JsError::new(e.as_string().unwrap_or_default().as_str())),
                Ok(value) => match value {
                    None => Err(JsError::new("JsValue is not iterable")),
                    Some(value) => Ok(value),
                },
            }?;

            let mut did_list = Vec::<DID>::new();
            for item in iterator {
                let item = match item {
                    Err(e) => Err(JsError::new(e.as_string().unwrap_or_default().as_str())),
                    Ok(value) => Ok(value),
                }?;
                let str = item
                    .as_string()
                    .ok_or_else(|| JsError::new("JsValue is not a string"))?;
                did_list.push(DID::from_str(&str)?);
            }
            Ok(identity::Identifier::DIDList(did_list))
        }
        Identifier::Username => match value.as_string() {
            Some(s) => Ok(identity::Identifier::Username(s)),
            None => Err(JsError::new("JsValue is not a string")),
        },
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

    pub fn image_type(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.0.image_type()).unwrap()
    }
}

#[wasm_bindgen]
pub struct Identity(warp::multipass::identity::Identity);

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
    pub fn metadata(&self) -> wasm_bindgen::JsValue {
        serde_wasm_bindgen::to_value(&self.0.metadata()).expect("valid ser")
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
    pub fn set_metadata(&mut self, map: Map) {
        let mut index_map = IndexMap::new();
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
        self.0.passphrase().map(|s|s.to_string())
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
