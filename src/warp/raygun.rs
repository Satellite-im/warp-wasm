use crate::warp::stream::{AsyncIterator, InnerStream};
use futures::StreamExt;
use indexmap::IndexSet;
use js_sys::Promise;
use serde::{Deserialize, Serialize};
use tsify_next::Tsify;
use std::str::FromStr;
use uuid::Uuid;
use warp::raygun::{
    GroupPermissionOpt, RayGunAttachment, RayGunConversationInformation, RayGunEvents,
    RayGunGroupConversation, RayGunStream,
};
use warp::warp::dummy::Dummy;
use warp::warp::Warp;
use warp::{
    crypto::DID,
    raygun::{self, Location, LocationKind, RayGun},
};
use warp_ipfs::{WarpIpfs, WarpIpfsInstance};
use wasm_bindgen::prelude::*;

use super::constellation::{File, FileType, Progression};
use super::multipass::MetaData;

#[derive(Clone)]
#[wasm_bindgen]
pub struct RayGunBox {
    inner: Warp<Dummy, WarpIpfs, Dummy>,
}
impl RayGunBox {
    pub fn new(instance: &WarpIpfsInstance) -> Self {
        Self {
            inner: instance.clone().split_raygun(),
        }
    }
}

/// impl RayGun trait
#[wasm_bindgen]
impl RayGunBox {
    pub async fn set_conversation_description(
        &mut self,
        conversation_id: String,
        description: Option<String>,
    ) -> Result<(), JsError> {
        self.inner
            .set_conversation_description(
                Uuid::from_str(&conversation_id).unwrap(),
                description.as_deref(),
            )
            .await
            .map_err(|e| e.into())
    }
}

/// impl RayGun trait
#[wasm_bindgen]
impl RayGunBox {
    // Start a new conversation.
    pub async fn create_conversation(&mut self, did: String) -> Result<Conversation, JsError> {
        self.inner
            .create_conversation(&DID::from_str(&did).unwrap())
            .await
            .map_err(|e| e.into())
            .map(|ok| Conversation::new(ok))
    }

    pub async fn create_group_conversation(
        &mut self,
        name: Option<String>,
        recipients: Vec<String>,
        permissions: GroupPermissions,
    ) -> Result<Conversation, JsError> {
        let recipients = recipients
            .iter()
            .map(|did| DID::from_str(did).unwrap())
            .collect();
        self.inner
            .create_group_conversation(
                name,
                recipients,
                GroupPermissionOpt::Map(warp::raygun::GroupPermissions::from(permissions)),
            )
            .await
            .map_err(|e| e.into())
            .map(|ok| Conversation::new(ok))
    }

    /// Get an active conversation
    pub async fn get_conversation(&self, conversation_id: String) -> Result<Conversation, JsError> {
        self.inner
            .get_conversation(Uuid::from_str(&conversation_id).unwrap())
            .await
            .map_err(|e| e.into())
            .map(|ok| Conversation::new(ok))
    }

    pub async fn set_favorite_conversation(
        &mut self,
        conversation_id: String,
        favorite: bool,
    ) -> Result<(), JsError> {
        self.inner
            .set_favorite_conversation(Uuid::from_str(&conversation_id).unwrap(), favorite)
            .await
            .map_err(|e| e.into())
    }

    /// List all active conversations
    pub async fn list_conversations(&self) -> Result<ConversationList, JsError> {
        self.inner
            .list_conversations()
            .await
            .map_err(|e| e.into())
            .map(|ok| ConversationList { inner: ok })
    }

    /// Retrieve all messages from a conversation
    pub async fn get_message(
        &self,
        conversation_id: String,
        message_id: String,
    ) -> Result<Message, JsError> {
        self.inner
            .get_message(
                Uuid::from_str(&conversation_id).unwrap(),
                Uuid::from_str(&message_id).unwrap(),
            )
            .await
            .map_err(|e| e.into())
            .map(|ok| Message::new(ok))
    }

    /// Get a number of messages in a conversation
    pub async fn get_message_count(&self, conversation_id: String) -> Result<usize, JsError> {
        self.inner
            .get_message_count(Uuid::from_str(&conversation_id).unwrap())
            .await
            .map_err(|e| e.into())
    }

    /// Get a status of a message in a conversation
    pub async fn message_status(
        &self,
        conversation_id: String,
        message_id: String,
    ) -> Result<MessageStatus, JsError> {
        self.inner
            .message_status(
                Uuid::from_str(&conversation_id).unwrap(),
                Uuid::from_str(&message_id).unwrap(),
            )
            .await
            .map_err(|e| e.into())
            .map(|ok| ok.into())
    }

    /// Retrieve all message references from a conversation
    pub async fn get_message_references(
        &self,
        conversation_id: String,
        options: MessageOptions,
    ) -> Result<AsyncIterator, JsError> {
        self.inner
            .get_message_references(Uuid::from_str(&conversation_id).unwrap(), options.inner)
            .await
            .map_err(|e| e.into())
            .map(|s| AsyncIterator::new(Box::pin(s.map(|t| MessageReference::new(t).into()))))
    }

    /// Retrieve a message reference from a conversation
    pub async fn get_message_reference(
        &self,
        conversation_id: String,
        message_id: String,
    ) -> Result<MessageReference, JsError> {
        self.inner
            .get_message_reference(
                Uuid::from_str(&conversation_id).unwrap(),
                Uuid::from_str(&message_id).unwrap(),
            )
            .await
            .map_err(|e| e.into())
            .map(|ok| MessageReference::new(ok))
    }

    /// Retrieve all messages from a conversation
    pub async fn get_messages(
        &self,
        conversation_id: String,
        options: MessageOptions,
    ) -> Result<Messages, JsError> {
        self.inner
            .get_messages(Uuid::from_str(&conversation_id).unwrap(), options.inner)
            .await
            .map_err(|e| e.into())
            .map(|ok| Messages::new(ok))
    }

    /// Sends a message to a conversation.
    pub async fn send(
        &mut self,
        conversation_id: String,
        message: Vec<String>,
    ) -> Result<String, JsError> {
        self.inner
            .send(Uuid::from_str(&conversation_id).unwrap(), message)
            .await
            .map_err(|e| e.into())
            .map(|ok| ok.to_string())
    }

    /// Edit an existing message in a conversation.
    pub async fn edit(
        &mut self,
        conversation_id: String,
        message_id: String,
        message: Vec<String>,
    ) -> Result<(), JsError> {
        self.inner
            .edit(
                Uuid::from_str(&conversation_id).unwrap(),
                Uuid::from_str(&message_id).unwrap(),
                message,
            )
            .await
            .map_err(|e| e.into())
    }

    /// Delete message from a conversation
    pub async fn delete(
        &mut self,
        conversation_id: String,
        message_id: Option<String>,
    ) -> Result<(), JsError> {
        self.inner
            .delete(
                Uuid::from_str(&conversation_id).unwrap(),
                message_id.map(|s| Uuid::from_str(&s).unwrap()),
            )
            .await
            .map_err(|e| e.into())
    }

    /// React to a message
    pub async fn react(
        &mut self,
        conversation_id: String,
        message_id: String,
        state: ReactionState,
        emoji: String,
    ) -> Result<(), JsError> {
        self.inner
            .react(
                Uuid::from_str(&conversation_id).unwrap(),
                Uuid::from_str(&message_id).unwrap(),
                state.into(),
                emoji,
            )
            .await
            .map_err(|e| e.into())
    }

    /// Pin a message within a conversation
    pub async fn pin(
        &mut self,
        conversation_id: String,
        message_id: String,
        state: PinState,
    ) -> Result<(), JsError> {
        self.inner
            .pin(
                Uuid::from_str(&conversation_id).unwrap(),
                Uuid::from_str(&message_id).unwrap(),
                state.into(),
            )
            .await
            .map_err(|e| e.into())
    }

    /// Reply to a message within a conversation
    pub async fn reply(
        &mut self,
        conversation_id: String,
        message_id: String,
        message: Vec<String>,
    ) -> Result<String, JsError> {
        self.inner
            .reply(
                Uuid::from_str(&conversation_id).unwrap(),
                Uuid::from_str(&message_id).unwrap(),
                message,
            )
            .await
            .map_err(|e| e.into())
            .map(|ok| ok.to_string())
    }

    pub async fn embeds(
        &mut self,
        conversation_id: String,
        message_id: String,
        state: EmbedState,
    ) -> Result<(), JsError> {
        self.inner
            .embeds(
                Uuid::from_str(&conversation_id).unwrap(),
                Uuid::from_str(&message_id).unwrap(),
                state.into(),
            )
            .await
            .map_err(|e| e.into())
    }

    /// Update conversation permissions
    pub async fn update_conversation_permissions(
        &mut self,
        conversation_id: String,
        permissions: GroupPermissions,
    ) -> Result<(), JsError> {
        self.inner
            .update_conversation_permissions(
                Uuid::from_str(&conversation_id).unwrap(),
                GroupPermissionOpt::Map(warp::raygun::GroupPermissions::from(permissions)),
            )
            .await
            .map_err(|e| e.into())
    }

    pub async fn conversation_icon(
        &self,
        conversation_id: String,
    ) -> Result<ConversationImage, JsError> {
        self.inner
            .conversation_icon(Uuid::from_str(&conversation_id).unwrap())
            .await
            .map(|img| ConversationImage(img))
            .map_err(|e| e.into())
    }

    pub async fn conversation_banner(
        &self,
        conversation_id: String,
    ) -> Result<ConversationImage, JsError> {
        self.inner
            .conversation_banner(Uuid::from_str(&conversation_id).unwrap())
            .await
            .map(|img| ConversationImage(img))
            .map_err(|e| e.into())
    }

    pub async fn update_conversation_icon(
        &mut self,
        conversation_id: String,
        file: AttachmentFile,
    ) -> Result<(), JsError> {
        self.inner
            .update_conversation_icon(Uuid::from_str(&conversation_id).unwrap(), file.into())
            .await
            .map_err(|e| e.into())
    }

    pub async fn update_conversation_banner(
        &mut self,
        conversation_id: String,
        file: AttachmentFile,
    ) -> Result<(), JsError> {
        self.inner
            .update_conversation_banner(Uuid::from_str(&conversation_id).unwrap(), file.into())
            .await
            .map_err(|e| e.into())
    }

    pub async fn remove_conversation_icon(
        &mut self,
        conversation_id: String,
    ) -> Result<(), JsError> {
        self.inner
            .remove_conversation_icon(Uuid::from_str(&conversation_id).unwrap())
            .await
            .map_err(|e| e.into())
    }

    pub async fn remove_conversation_banner(
        &mut self,
        conversation_id: String,
    ) -> Result<(), JsError> {
        self.inner
            .remove_conversation_banner(Uuid::from_str(&conversation_id).unwrap())
            .await
            .map_err(|e| e.into())
    }

    pub async fn archived_conversation(&mut self, conversation_id: String) -> Result<(), JsError> {
        self.inner
            .archived_conversation(Uuid::from_str(&conversation_id).unwrap())
            .await
            .map_err(|e| e.into())
    }

    pub async fn unarchived_conversation(
        &mut self,
        conversation_id: String,
    ) -> Result<(), JsError> {
        self.inner
            .unarchived_conversation(Uuid::from_str(&conversation_id).unwrap())
            .await
            .map_err(|e| e.into())
    }
}

/// impl RayGunGroup trait
#[wasm_bindgen]
impl RayGunBox {
    //Update conversation name Note: This will only update the group conversation name
    pub async fn update_conversation_name(
        &mut self,
        conversation_id: String,
        name: String,
    ) -> Result<(), JsError> {
        self.inner
            .update_conversation_name(Uuid::from_str(&conversation_id).unwrap(), &name)
            .await
            .map_err(|e| e.into())
    }

    /// Add a recipient to the conversation
    pub async fn add_recipient(
        &mut self,
        conversation_id: String,
        recipient: String,
    ) -> Result<(), JsError> {
        self.inner
            .add_recipient(
                Uuid::from_str(&conversation_id).unwrap(),
                &DID::from_str(&recipient).unwrap(),
            )
            .await
            .map_err(|e| e.into())
    }

    /// Remove a recipient from the conversation
    pub async fn remove_recipient(
        &mut self,
        conversation_id: String,
        recipient: String,
    ) -> Result<(), JsError> {
        self.inner
            .remove_recipient(
                Uuid::from_str(&conversation_id).unwrap(),
                &DID::from_str(&recipient).unwrap(),
            )
            .await
            .map_err(|e| e.into())
    }
}

/// impl RayGunAttachment trait
#[wasm_bindgen]
impl RayGunBox {
    /// Send files to a conversation.
    /// If no files is provided in the array, it will throw an error
    pub async fn attach(
        &mut self,
        conversation_id: String,
        message_id: Option<String>,
        files: Vec<AttachmentFile>,
        message: Vec<String>,
    ) -> Result<AttachmentResult, JsError> {
        self.inner
            .attach(
                Uuid::from_str(&conversation_id).unwrap(),
                message_id.map(|s| Uuid::from_str(&s).unwrap()),
                files.iter().map(|f| f.clone().into()).collect(),
                message,
            )
            .await
            .map_err(|e| e.into())
            .map(|(id, ok)| AttachmentResult {
                message_id: id.to_string(),
                stream: AsyncIterator::new(Box::pin(
                    ok.map(|s| serde_wasm_bindgen::to_value(&AttachmentKind::from(s)).unwrap()),
                )),
            })
    }

    /// Stream a file that been attached to a message
    /// Note: Must use the filename associated when downloading
    pub async fn download_stream(
        &self,
        conversation_id: String,
        message_id: String,
        file: String,
    ) -> Result<AsyncIterator, JsError> {
        self.inner
            .download_stream(
                Uuid::from_str(&conversation_id).unwrap(),
                Uuid::from_str(&message_id).unwrap(),
                &file,
            )
            .await
            .map_err(|e| e.into())
            .map(|ok| {
                AsyncIterator::new(Box::pin(ok.map(|s| match s {
                    Ok(v) => serde_wasm_bindgen::to_value(&v).unwrap(),
                    Err(e) => {
                        let err: JsError = e.into();
                        err.into()
                    }
                })))
            })
    }
}

/// impl RayGunStream trait
#[wasm_bindgen]
impl RayGunBox {
    /// Subscribe to an stream of events from the conversation
    pub async fn get_conversation_stream(
        &mut self,
        conversation_id: String,
    ) -> Result<AsyncIterator, JsError> {
        self.inner
            .get_conversation_stream(Uuid::from_str(&conversation_id).unwrap())
            .await
            .map_err(|e| e.into())
            .map(|ok| {
                AsyncIterator::new(Box::pin(
                    ok.map(|s| serde_wasm_bindgen::to_value(&s).unwrap()),
                ))
            })
    }

    /// Subscribe to an stream of events
    pub async fn raygun_subscribe(&mut self) -> Result<AsyncIterator, JsError> {
        self.inner
            .raygun_subscribe()
            .await
            .map_err(|e| e.into())
            .map(|ok| {
                AsyncIterator::new(Box::pin(
                    ok.map(|s| serde_wasm_bindgen::to_value(&s).unwrap()),
                ))
            })
    }
}

/// impl RayGunEvents trait
#[wasm_bindgen]
impl RayGunBox {
    /// Send an event to a conversation
    pub async fn send_event(
        &mut self,
        conversation_id: String,
        event: MessageEvent,
    ) -> Result<(), JsError> {
        self.inner
            .send_event(Uuid::from_str(&conversation_id).unwrap(), event.into())
            .await
            .map_err(|e| e.into())
    }

    /// Cancel event that was sent, if any.
    pub async fn cancel_event(
        &mut self,
        conversation_id: String,
        event: MessageEvent,
    ) -> Result<(), JsError> {
        self.inner
            .cancel_event(Uuid::from_str(&conversation_id).unwrap(), event.into())
            .await
            .map_err(|e| e.into())
    }
}

#[derive(Serialize, Deserialize)]
#[wasm_bindgen]
pub struct ConversationList {
    inner: Vec<raygun::Conversation>,
}
#[wasm_bindgen]
impl ConversationList {
    pub fn convs(&self) -> Vec<Conversation> {
        self.inner
            .iter()
            .map(|c| Conversation::new(c.clone()))
            .collect()
    }
}

#[derive(Serialize, Deserialize)]
#[wasm_bindgen]
pub struct Conversation {
    inner: raygun::Conversation,
}
#[wasm_bindgen]
impl Conversation {
    fn new(inner: raygun::Conversation) -> Self {
        Self { inner }
    }

    pub fn id(&self) -> String {
        self.inner.id().to_string()
    }
    pub fn name(&self) -> Option<String> {
        self.inner.name()
    }
    pub fn creator(&self) -> Option<String> {
        self.inner.creator().map(|did| did.to_string())
    }
    pub fn created(&self) -> js_sys::Date {
        self.inner.created().into()
    }
    pub fn modified(&self) -> js_sys::Date {
        self.inner.modified().into()
    }
    pub fn favorite(&self) -> bool {
        self.inner.favorite()
    }
    pub fn conversation_type(&self) -> ConversationType {
        self.inner.conversation_type().into()
    }
    pub fn permissions(&self) -> GroupPermissions {
        GroupPermissions(self.inner.permissions())
    }
    pub fn recipients(&self) -> Vec<String> {
        self.inner
            .recipients()
            .iter()
            .map(|did| did.to_string())
            .collect()
    }
    pub fn archived(&self) -> bool {
        self.inner.archived()
    }
}

#[wasm_bindgen]
pub struct Messages {
    variant: MessagesEnum,
    value: JsValue,
}

#[wasm_bindgen]
impl Messages {
    fn new(messages: raygun::Messages) -> Self {
        match messages {
            raygun::Messages::List(list) => Self {
                variant: MessagesEnum::List,
                value: serde_wasm_bindgen::to_value(&list).unwrap(),
            },
            raygun::Messages::Stream(stream) => Self {
                variant: MessagesEnum::List,
                value: AsyncIterator::new(Box::pin(stream.map(|s| Message::new(s).into()))).into(),
            },
            raygun::Messages::Page { pages, total } => {
                let pages = pages
                    .iter()
                    .map(|p| MessagePage {
                        id: p.id(),
                        messages: p
                            .messages()
                            .iter()
                            .map(|m| Message::new(m.clone()))
                            .collect(),
                        total: p.total(),
                    })
                    .collect();

                Self {
                    variant: MessagesEnum::Page,
                    value: serde_wasm_bindgen::to_value(&Page { pages, total }).unwrap(),
                }
            }
        }
    }
    pub fn variant(&self) -> MessagesEnum {
        self.variant
    }
    pub fn value(&self) -> JsValue {
        self.value.clone()
    }
}
#[derive(Serialize, Deserialize)]
pub struct Page {
    pub pages: Vec<MessagePage>,
    pub total: usize,
}
#[derive(Serialize, Deserialize)]
pub struct MessagePage {
    pub id: usize,
    pub messages: Vec<Message>,
    pub total: usize,
}
#[wasm_bindgen]
#[derive(Copy, Clone)]
pub enum MessagesEnum {
    List,
    Stream,
    Page,
}

#[wasm_bindgen]
pub struct MessageOptions {
    inner: raygun::MessageOptions,
}
#[wasm_bindgen]
impl MessageOptions {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            inner: raygun::MessageOptions::default(),
        }
    }

    pub fn set_date_range(&mut self, start: js_sys::Date, end: js_sys::Date) {
        self.inner = self
            .inner
            .clone()
            .set_date_range(core::ops::Range {
                start: start.into(),
                end: end.into()
            });
    }

    pub fn set_range(&mut self, start: usize, end: usize) {
        self.inner = self
            .inner
            .clone()
            .set_range(core::ops::Range {
                start,
                end
            });
    }

    pub fn set_limit(&mut self, limit: u8) {
        self.inner = self.inner.clone().set_limit(limit);
    }

    pub fn set_skip(&mut self, skip: i64) {
        self.inner = self.inner.clone().set_skip(skip);
    }

    pub fn set_keyword(&mut self, keyword: &str) {
        self.inner = self.inner.clone().set_keyword(keyword);
    }

    pub fn set_first_message(&mut self) {
        self.inner = self.inner.clone().set_first_message();
    }

    pub fn set_last_message(&mut self) {
        self.inner = self.inner.clone().set_last_message();
    }

    pub fn set_pinned(&mut self) {
        self.inner = self.inner.clone().set_pinned();
    }

    pub fn set_reverse(&mut self) {
        self.inner = self.inner.clone().set_reverse();
    }

    pub fn set_messages_type(&mut self, ty: MessagesType) {
        self.inner = self
            .inner
            .clone()
            .set_messages_type(ty.into());
    }
}

#[wasm_bindgen]
pub struct MessageReference {
    inner: raygun::MessageReference,
}
#[wasm_bindgen]
impl MessageReference {
    fn new(inner: raygun::MessageReference) -> Self {
        Self { inner }
    }

    pub fn id(&self) -> String {
        self.inner.id().to_string()
    }

    pub fn conversation_id(&self) -> String {
        self.inner.conversation_id().to_string()
    }

    pub fn sender(&self) -> String {
        self.inner.sender().to_string()
    }

    pub fn date(&self) -> js_sys::Date {
        self.inner.date().into()
    }

    pub fn modified(&self) -> Option<js_sys::Date> {
        self.inner.modified().map(|d| d.into())
    }

    pub fn pinned(&self) -> bool {
        self.inner.pinned()
    }

    pub fn replied(&self) -> Option<String> {
        self.inner.replied().map(|uuid| uuid.to_string())
    }

    pub fn deleted(&self) -> bool {
        self.inner.deleted()
    }
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(typescript_type = "Map<string, string[]>")]
    pub type ReactionMap;
}

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct Message {
    inner: raygun::Message,
}
#[wasm_bindgen]
impl Message {
    fn new(inner: raygun::Message) -> Self {
        Self { inner }
    }

    pub fn id(&self) -> String {
        self.inner.id().to_string()
    }

    pub fn message_type(&self) -> MessageType {
        self.inner.message_type().into()
    }

    pub fn conversation_id(&self) -> String {
        self.inner.conversation_id().to_string()
    }

    pub fn sender(&self) -> String {
        self.inner.sender().to_string()
    }

    pub fn date(&self) -> js_sys::Date {
        self.inner.date().into()
    }

    pub fn modified(&self) -> Option<js_sys::Date> {
        self.inner.modified().map(|d| d.into())
    }

    pub fn pinned(&self) -> bool {
        self.inner.pinned()
    }

    pub fn reactions(&self) -> ReactionMap {
        ReactionMap::from(serde_wasm_bindgen::to_value(&self.inner.reactions()).unwrap())
    }

    pub fn mentions(&self) -> Vec<String> {
        self.inner
            .mentions()
            .iter()
            .map(|did| did.to_string())
            .collect()
    }

    pub fn lines(&self) -> Vec<String> {
        self.inner.lines()
    }

    pub fn attachments(&self) -> Vec<File> {
        self.inner
            .attachments()
            .iter()
            .map(|v| File::from_file(v.clone()))
            .collect()
    }

    pub fn metadata(&self) -> MetaData {
        MetaData::from(serde_wasm_bindgen::to_value(&self.inner.metadata()).unwrap())
    }

    pub fn replied(&self) -> Option<String> {
        self.inner.replied().map(|uuid| uuid.to_string())
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
#[wasm_bindgen]
pub struct AttachmentFile {
    file: String,
    stream: Option<AttachmentStream>,
}
#[wasm_bindgen]
impl AttachmentFile {
    #[wasm_bindgen(constructor)]
    pub fn new(file: String, stream: Option<AttachmentStream>) -> Self {
        Self { file, stream }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
#[wasm_bindgen]
pub struct AttachmentStream {
    size: Option<usize>,
    stream: web_sys::ReadableStream,
}
#[wasm_bindgen]
impl AttachmentStream {
    #[wasm_bindgen(constructor)]
    pub fn new(size: Option<usize>, stream: web_sys::ReadableStream) -> Self {
        Self { size, stream }
    }
}
impl Into<raygun::Location> for AttachmentFile {
    fn into(self) -> raygun::Location {
        if let Some(attachment) = self.stream {
            Location::Stream {
                name: self.file,
                size: attachment.size,
                stream: {
                    let stream = InnerStream::from(wasm_streams::ReadableStream::from_raw(
                        attachment.stream,
                    ));
                    Box::pin(stream)
                },
            }
        } else {
            Location::Constellation { path: self.file }
        }
    }
}

#[wasm_bindgen]
pub struct AttachmentResult {
    message_id: String,
    stream: AsyncIterator,
}

#[wasm_bindgen]
impl AttachmentResult {
    pub fn get_message_id(&self) -> String {
        self.message_id.clone()
    }

    pub async fn next(&mut self) -> std::result::Result<Promise, JsError> {
        self.stream.next().await
    }
}

#[derive(serde::Serialize)]
pub enum AttachmentKind {
    AttachedProgress(LocationKind, Progression),
    Pending(Result<(), String>),
}

impl From<raygun::AttachmentKind> for AttachmentKind {
    fn from(value: raygun::AttachmentKind) -> Self {
        match value {
            raygun::AttachmentKind::AttachedProgress(loc, prog) => {
                AttachmentKind::AttachedProgress(loc, prog.into())
            }
            raygun::AttachmentKind::Pending(res) => {
                AttachmentKind::Pending(res.map_err(|e| e.to_string()))
            }
        }
    }
}

#[wasm_bindgen]
pub enum EmbedState {
    Enabled,
    Disable,
}

impl From<EmbedState> for warp::raygun::EmbedState {
    fn from(value: EmbedState) -> Self {
        match value {
            EmbedState::Enabled => raygun::EmbedState::Enabled,
            EmbedState::Disable => raygun::EmbedState::Disable,
        }
    }
}

#[wasm_bindgen]
pub enum PinState {
    Pin,
    Unpin,
}

impl From<PinState> for warp::raygun::PinState {
    fn from(value: PinState) -> Self {
        match value {
            PinState::Pin => raygun::PinState::Pin,
            PinState::Unpin => raygun::PinState::Unpin,
        }
    }
}

#[wasm_bindgen]
pub enum ReactionState {
    Add,
    Remove,
}

impl From<ReactionState> for warp::raygun::ReactionState {
    fn from(value: ReactionState) -> Self {
        match value {
            ReactionState::Add => raygun::ReactionState::Add,
            ReactionState::Remove => raygun::ReactionState::Remove,
        }
    }
}

#[wasm_bindgen]
pub enum MessageStatus {
    NotSent,
    Sent,
    Delivered,
}

impl From<warp::raygun::MessageStatus> for MessageStatus {
    fn from(value: warp::raygun::MessageStatus) -> Self {
        match value {
            warp::raygun::MessageStatus::NotSent => MessageStatus::NotSent,
            warp::raygun::MessageStatus::Sent => MessageStatus::Sent,
            warp::raygun::MessageStatus::Delivered => MessageStatus::Delivered,
        }
    }
}

#[wasm_bindgen]
pub enum MessageType {
    Message,
    Attachment,
    Event,
}

impl From<warp::raygun::MessageType> for MessageType {
    fn from(value: warp::raygun::MessageType) -> Self {
        match value {
            warp::raygun::MessageType::Message => MessageType::Message,
            warp::raygun::MessageType::Attachment => MessageType::Attachment,
            warp::raygun::MessageType::Event => MessageType::Event,
        }
    }
}

#[wasm_bindgen]
#[derive(Copy, Clone)]
pub enum ConversationType {
    Direct,
    Group,
}

impl From<warp::raygun::ConversationType> for ConversationType {
    fn from(value: warp::raygun::ConversationType) -> Self {
        match value {
            raygun::ConversationType::Direct => ConversationType::Direct,
            raygun::ConversationType::Group => ConversationType::Group,
        }
    }
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(typescript_type = "GroupPermission[]")]
    pub type GroupPermissionList;
}

#[derive(Debug, Clone, PartialEq, Eq)]
#[wasm_bindgen]
pub enum GroupPermission {
    AddParticipants,
    SetGroupName,
}

impl From<GroupPermission> for warp::raygun::GroupPermission {
    fn from(value: GroupPermission) -> Self {
        match value {
            GroupPermission::AddParticipants => warp::raygun::GroupPermission::AddParticipants,
            GroupPermission::SetGroupName => warp::raygun::GroupPermission::SetGroupName,
        }
    }
}
impl From<warp::raygun::GroupPermission> for GroupPermission {
    fn from(value: warp::raygun::GroupPermission) -> Self {
        match value {
            warp::raygun::GroupPermission::AddParticipants => GroupPermission::AddParticipants,
            warp::raygun::GroupPermission::SetGroupName => GroupPermission::SetGroupName,
        }
    }
}

#[wasm_bindgen]
pub struct GroupPermissions(warp::raygun::GroupPermissions);

#[wasm_bindgen]
impl GroupPermissions {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self(warp::raygun::GroupPermissions::new())
    }

    pub fn set_permissions(
        &mut self,
        did: String,
        permissions: Vec<GroupPermission>,
    ) -> Result<(), JsError> {
        let did = DID::from_str(&did)?;
        let permissions: IndexSet<warp::raygun::GroupPermission> =
            permissions.into_iter().map(|p| p.into()).collect();
        self.0.insert(did, permissions);
        Ok(())
    }
    pub fn get_permissions(&self, did: String) -> Result<Option<Vec<GroupPermission>>, JsError> {
        let result = self.0.get(&DID::from_str(&did)?);
        let result: Option<Vec<GroupPermission>> =
            result.map(|s| s.into_iter().map(|p| (*p).into()).collect());
        Ok(result)
    }
    pub fn remove_permissions(&mut self, did: String) -> Result<(), JsError> {
        self.0.swap_remove(&DID::from_str(&did)?);
        Ok(())
    }
}

impl From<GroupPermissions> for warp::raygun::GroupPermissions {
    fn from(value: GroupPermissions) -> Self {
        value.0
    }
}

#[wasm_bindgen]
pub struct ConversationImage(warp::raygun::ConversationImage);

impl ConversationImage {
    pub fn data(&self) -> &[u8] {
        &self.0.data()
    }

    pub fn image_type(&self) -> FileType {
        self.0.image_type().into()
    }
}

#[wasm_bindgen]
pub enum MessageEvent {
    Typing,
}

impl From<MessageEvent> for warp::raygun::MessageEvent {
    fn from(value: MessageEvent) -> Self {
        match value {
            MessageEvent::Typing => raygun::MessageEvent::Typing,
        }
    }
}

#[derive(Tsify, Deserialize, Serialize)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum MessagesType {
    /// Stream type
    Stream,
    /// List type
    List,
    /// Page type
    Pages {
        /// Page to select
        page: Option<usize>,
        /// Amount of messages per page
        amount_per_page: Option<usize>,
    },
}

impl Into<raygun::MessagesType> for MessagesType {
    fn into(self) -> raygun::MessagesType {
        match self {
            MessagesType::Stream => raygun::MessagesType::Stream,
            MessagesType::List => raygun::MessagesType::List,
            MessagesType::Pages{page, amount_per_page} => raygun::MessagesType::Pages{page, amount_per_page},
        }
    }
}