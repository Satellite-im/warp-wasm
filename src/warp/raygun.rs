use crate::warp::stream::{AsyncIterator, InnerStream};
use futures::StreamExt;
use indexmap::IndexSet;
use js_sys::{Array, Promise};
use serde::{Deserialize, Serialize};
use std::str::FromStr;
use tsify_next::Tsify;
use uuid::Uuid;
use warp::raygun::{
    community::RayGunCommunity, GroupPermissionOpt, RayGunAttachment,
    RayGunConversationInformation, RayGunEvents, RayGunGroupConversation, RayGunStream,
};
use warp::warp::dummy::Dummy;
use warp::warp::Warp;
use warp::{
    crypto::DID,
    raygun::{self, Location, LocationKind, RayGun},
};
use warp_ipfs::{WarpIpfs, WarpIpfsInstance};
use wasm_bindgen::convert::TryFromJsValue;
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

/// impl RayGunCommunity trait
#[wasm_bindgen]
impl RayGunBox {
    pub async fn get_community_stream(
        &mut self,
        community_id: String,
    ) -> Result<AsyncIterator, JsError> {
        self.inner
            .get_community_stream(Uuid::from_str(&community_id).unwrap())
            .await
            .map_err(|e| e.into())
            .map(|ok| {
                AsyncIterator::new(Box::pin(
                    ok.map(|s| serde_wasm_bindgen::to_value(&s).unwrap()),
                ))
            })
    }

    pub async fn create_community(&mut self, name: String) -> Result<Community, JsError> {
        self.inner
            .create_community(&name)
            .await
            .map_err(|e| e.into())
            .map(|inner| Community { inner })
    }
    pub async fn delete_community(&mut self, community_id: String) -> Result<(), JsError> {
        self.inner
            .delete_community(Uuid::from_str(&community_id).unwrap())
            .await
            .map_err(|e| e.into())
    }
    pub async fn get_community(&self, community_id: String) -> Result<Community, JsError> {
        self.inner
            .get_community(Uuid::from_str(&community_id).unwrap())
            .await
            .map_err(|e| e.into())
            .map(|inner| Community { inner })
    }

    pub async fn list_communities_joined(&self) -> Result<Vec<String>, JsError> {
        self.inner
            .list_communities_joined()
            .await
            .map_err(|e| e.into())
            .map(|ids| ids.iter().map(|id| id.to_string()).collect())
    }
    pub async fn list_communities_invited_to(&self) -> Result<Vec<CommunityInvitation>, JsError> {
        self.inner
            .list_communities_invited_to()
            .await
            .map_err(|e| e.into())
            .map(|invites| {
                invites
                    .into_iter()
                    .map(|(id, inv)| CommunityInvitation {
                        community: id.to_string(),
                        invite: inv.into(),
                    })
                    .collect()
            })
    }
    pub async fn leave_community(&mut self, community_id: String) -> Result<(), JsError> {
        self.inner
            .leave_community(Uuid::from_str(&community_id).unwrap())
            .await
            .map_err(|e| e.into())
    }

    pub async fn get_community_icon(
        &self,
        community_id: String,
    ) -> Result<ConversationImage, JsError> {
        self.inner
            .get_community_icon(Uuid::from_str(&community_id).unwrap())
            .await
            .map_err(|e| e.into())
            .map(|img| ConversationImage(img))
    }
    pub async fn get_community_banner(
        &self,
        community_id: String,
    ) -> Result<ConversationImage, JsError> {
        self.inner
            .get_community_banner(Uuid::from_str(&community_id).unwrap())
            .await
            .map_err(|e| e.into())
            .map(|img| ConversationImage(img))
    }
    pub async fn edit_community_icon(
        &mut self,
        community_id: String,
        file: AttachmentFile,
    ) -> Result<(), JsError> {
        self.inner
            .edit_community_icon(Uuid::from_str(&community_id).unwrap(), file.into())
            .await
            .map_err(|e| e.into())
    }
    pub async fn edit_community_banner(
        &mut self,
        community_id: String,
        file: AttachmentFile,
    ) -> Result<(), JsError> {
        self.inner
            .edit_community_banner(Uuid::from_str(&community_id).unwrap(), file.into())
            .await
            .map_err(|e| e.into())
    }

    pub async fn create_community_invite(
        &mut self,
        community_id: String,
        target_user: Option<String>,
        expiry: Option<js_sys::Date>,
    ) -> Result<CommunityInvite, JsError> {
        self.inner
            .create_community_invite(
                Uuid::from_str(&community_id).unwrap(),
                target_user.map(|did| DID::from_str(&did).unwrap()),
                expiry.map(|d| d.into()),
            )
            .await
            .map_err(|e| e.into())
            .map(|inv| inv.into())
    }
    pub async fn delete_community_invite(
        &mut self,
        community_id: String,
        invite_id: String,
    ) -> Result<(), JsError> {
        self.inner
            .delete_community_invite(
                Uuid::from_str(&community_id).unwrap(),
                Uuid::from_str(&invite_id).unwrap(),
            )
            .await
            .map_err(|e| e.into())
    }
    pub async fn get_community_invite(
        &self,
        community_id: String,
        invite_id: String,
    ) -> Result<CommunityInvite, JsError> {
        self.inner
            .get_community_invite(
                Uuid::from_str(&community_id).unwrap(),
                Uuid::from_str(&invite_id).unwrap(),
            )
            .await
            .map_err(|e| e.into())
            .map(|inv| inv.into())
    }
    pub async fn accept_community_invite(
        &mut self,
        community_id: String,
        invite_id: String,
    ) -> Result<(), JsError> {
        self.inner
            .accept_community_invite(
                Uuid::from_str(&community_id).unwrap(),
                Uuid::from_str(&invite_id).unwrap(),
            )
            .await
            .map_err(|e| e.into())
    }
    pub async fn edit_community_invite(
        &mut self,
        community_id: String,
        invite_id: String,
        invite: CommunityInvite,
    ) -> Result<(), JsError> {
        self.inner
            .edit_community_invite(
                Uuid::from_str(&community_id).unwrap(),
                Uuid::from_str(&invite_id).unwrap(),
                invite.into(),
            )
            .await
            .map_err(|e| e.into())
    }

    pub async fn create_community_role(
        &mut self,
        community_id: String,
        name: String,
    ) -> Result<CommunityRole, JsError> {
        self.inner
            .create_community_role(Uuid::from_str(&community_id).unwrap(), &name)
            .await
            .map_err(|e| e.into())
            .map(|role| role.into())
    }
    pub async fn delete_community_role(
        &mut self,
        community_id: String,
        role_id: String,
    ) -> Result<(), JsError> {
        self.inner
            .delete_community_role(
                Uuid::from_str(&community_id).unwrap(),
                Uuid::from_str(&role_id).unwrap(),
            )
            .await
            .map_err(|e| e.into())
    }
    pub async fn get_community_role(
        &mut self,
        community_id: String,
        role_id: String,
    ) -> Result<CommunityRole, JsError> {
        self.inner
            .get_community_role(
                Uuid::from_str(&community_id).unwrap(),
                Uuid::from_str(&role_id).unwrap(),
            )
            .await
            .map_err(|e| e.into())
            .map(|role| role.into())
    }
    pub async fn edit_community_role_name(
        &mut self,
        community_id: String,
        role_id: String,
        new_name: String,
    ) -> Result<(), JsError> {
        self.inner
            .edit_community_role_name(
                Uuid::from_str(&community_id).unwrap(),
                Uuid::from_str(&role_id).unwrap(),
                new_name,
            )
            .await
            .map_err(|e| e.into())
    }
    pub async fn grant_community_role(
        &mut self,
        community_id: String,
        role_id: String,
        user: String,
    ) -> Result<(), JsError> {
        self.inner
            .grant_community_role(
                Uuid::from_str(&community_id).unwrap(),
                Uuid::from_str(&role_id).unwrap(),
                DID::from_str(&user).unwrap(),
            )
            .await
            .map_err(|e| e.into())
    }
    pub async fn revoke_community_role(
        &mut self,
        community_id: String,
        role_id: String,
        user: String,
    ) -> Result<(), JsError> {
        self.inner
            .revoke_community_role(
                Uuid::from_str(&community_id).unwrap(),
                Uuid::from_str(&role_id).unwrap(),
                DID::from_str(&user).unwrap(),
            )
            .await
            .map_err(|e| e.into())
    }

    pub async fn create_community_channel(
        &mut self,
        community_id: String,
        channel_name: String,
        channel_type: CommunityChannelType,
    ) -> Result<CommunityChannel, JsError> {
        self.inner
            .create_community_channel(
                Uuid::from_str(&community_id).unwrap(),
                &channel_name,
                channel_type.into(),
            )
            .await
            .map_err(|e| e.into())
            .map(|inner| CommunityChannel { inner })
    }
    pub async fn delete_community_channel(
        &mut self,
        community_id: String,
        channel_id: String,
    ) -> Result<(), JsError> {
        self.inner
            .delete_community_channel(
                Uuid::from_str(&community_id).unwrap(),
                Uuid::from_str(&channel_id).unwrap(),
            )
            .await
            .map_err(|e| e.into())
    }
    pub async fn get_community_channel(
        &self,
        community_id: String,
        channel_id: String,
    ) -> Result<CommunityChannel, JsError> {
        self.inner
            .get_community_channel(
                Uuid::from_str(&community_id).unwrap(),
                Uuid::from_str(&channel_id).unwrap(),
            )
            .await
            .map_err(|e| e.into())
            .map(|inner| CommunityChannel { inner })
    }

    pub async fn edit_community_name(
        &mut self,
        community_id: String,
        name: String,
    ) -> Result<(), JsError> {
        self.inner
            .edit_community_name(Uuid::from_str(&community_id).unwrap(), &name)
            .await
            .map_err(|e| e.into())
    }
    pub async fn edit_community_description(
        &mut self,
        community_id: String,
        description: Option<String>,
    ) -> Result<(), JsError> {
        self.inner
            .edit_community_description(Uuid::from_str(&community_id).unwrap(), description)
            .await
            .map_err(|e| e.into())
    }
    pub async fn grant_community_permission(
        &mut self,
        community_id: String,
        permission: CommunityPermission,
        role_id: String,
    ) -> Result<(), JsError> {
        self.inner
            .grant_community_permission(
                Uuid::from_str(&community_id).unwrap(),
                permission.into(),
                Uuid::from_str(&role_id).unwrap(),
            )
            .await
            .map_err(|e| e.into())
    }
    pub async fn revoke_community_permission(
        &mut self,
        community_id: String,
        permission: CommunityPermission,
        role_id: String,
    ) -> Result<(), JsError> {
        self.inner
            .revoke_community_permission(
                Uuid::from_str(&community_id).unwrap(),
                permission.into(),
                Uuid::from_str(&role_id).unwrap(),
            )
            .await
            .map_err(|e| e.into())
    }
    pub async fn grant_community_permission_for_all(
        &mut self,
        community_id: String,
        permission: CommunityPermission,
    ) -> Result<(), JsError> {
        self.inner
            .grant_community_permission_for_all(
                Uuid::from_str(&community_id).unwrap(),
                permission.into(),
            )
            .await
            .map_err(|e| e.into())
    }
    pub async fn revoke_community_permission_for_all(
        &mut self,
        community_id: String,
        permission: CommunityPermission,
    ) -> Result<(), JsError> {
        self.inner
            .revoke_community_permission_for_all(
                Uuid::from_str(&community_id).unwrap(),
                permission.into(),
            )
            .await
            .map_err(|e| e.into())
    }
    pub async fn remove_community_member(
        &mut self,
        community_id: String,
        member: String,
    ) -> Result<(), JsError> {
        self.inner
            .remove_community_member(
                Uuid::from_str(&community_id).unwrap(),
                DID::from_str(&member).unwrap(),
            )
            .await
            .map_err(|e| e.into())
    }

    pub async fn edit_community_channel_name(
        &mut self,
        community_id: String,
        channel_id: String,
        name: String,
    ) -> Result<(), JsError> {
        self.inner
            .edit_community_channel_name(
                Uuid::from_str(&community_id).unwrap(),
                Uuid::from_str(&channel_id).unwrap(),
                &name,
            )
            .await
            .map_err(|e| e.into())
    }
    pub async fn edit_community_channel_description(
        &mut self,
        community_id: String,
        channel_id: String,
        description: Option<String>,
    ) -> Result<(), JsError> {
        self.inner
            .edit_community_channel_description(
                Uuid::from_str(&community_id).unwrap(),
                Uuid::from_str(&channel_id).unwrap(),
                description,
            )
            .await
            .map_err(|e| e.into())
    }
    pub async fn grant_community_channel_permission(
        &mut self,
        community_id: String,
        channel_id: String,
        permission: CommunityChannelPermission,
        role_id: String,
    ) -> Result<(), JsError> {
        self.inner
            .grant_community_channel_permission(
                Uuid::from_str(&community_id).unwrap(),
                Uuid::from_str(&channel_id).unwrap(),
                permission.into(),
                Uuid::from_str(&role_id).unwrap(),
            )
            .await
            .map_err(|e| e.into())
    }
    pub async fn revoke_community_channel_permission(
        &mut self,
        community_id: String,
        channel_id: String,
        permission: CommunityChannelPermission,
        role_id: String,
    ) -> Result<(), JsError> {
        self.inner
            .revoke_community_channel_permission(
                Uuid::from_str(&community_id).unwrap(),
                Uuid::from_str(&channel_id).unwrap(),
                permission.into(),
                Uuid::from_str(&role_id).unwrap(),
            )
            .await
            .map_err(|e| e.into())
    }
    pub async fn grant_community_channel_permission_for_all(
        &mut self,
        community_id: String,
        channel_id: String,
        permission: CommunityChannelPermission,
    ) -> Result<(), JsError> {
        self.inner
            .grant_community_channel_permission_for_all(
                Uuid::from_str(&community_id).unwrap(),
                Uuid::from_str(&channel_id).unwrap(),
                permission.into(),
            )
            .await
            .map_err(|e| e.into())
    }
    pub async fn revoke_community_channel_permission_for_all(
        &mut self,
        community_id: String,
        channel_id: String,
        permission: CommunityChannelPermission,
    ) -> Result<(), JsError> {
        self.inner
            .revoke_community_channel_permission_for_all(
                Uuid::from_str(&community_id).unwrap(),
                Uuid::from_str(&channel_id).unwrap(),
                permission.into(),
            )
            .await
            .map_err(|e| e.into())
    }

    pub async fn get_community_channel_message(
        &self,
        community_id: String,
        channel_id: String,
        message_id: String,
    ) -> Result<Message, JsError> {
        self.inner
            .get_community_channel_message(
                Uuid::from_str(&community_id).unwrap(),
                Uuid::from_str(&channel_id).unwrap(),
                Uuid::from_str(&message_id).unwrap(),
            )
            .await
            .map_err(|e| e.into())
            .map(|inner| Message { inner })
    }
    pub async fn get_community_channel_messages(
        &self,
        community_id: String,
        channel_id: String,
        options: MessageOptions,
    ) -> Result<Messages, JsError> {
        self.inner
            .get_community_channel_messages(
                Uuid::from_str(&community_id).unwrap(),
                Uuid::from_str(&channel_id).unwrap(),
                options.inner,
            )
            .await
            .map_err(|e| e.into())
            .map(|msgs| Messages::new(msgs))
    }
    pub async fn get_community_channel_message_count(
        &self,
        community_id: String,
        channel_id: String,
    ) -> Result<usize, JsError> {
        self.inner
            .get_community_channel_message_count(
                Uuid::from_str(&community_id).unwrap(),
                Uuid::from_str(&channel_id).unwrap(),
            )
            .await
            .map_err(|e| e.into())
    }
    pub async fn get_community_channel_message_reference(
        &self,
        community_id: String,
        channel_id: String,
        message_id: String,
    ) -> Result<MessageReference, JsError> {
        self.inner
            .get_community_channel_message_reference(
                Uuid::from_str(&community_id).unwrap(),
                Uuid::from_str(&channel_id).unwrap(),
                Uuid::from_str(&message_id).unwrap(),
            )
            .await
            .map_err(|e| e.into())
            .map(|inner| MessageReference { inner })
    }
    pub async fn get_community_channel_message_references(
        &self,
        community_id: String,
        channel_id: String,
        options: MessageOptions,
    ) -> Result<AsyncIterator, JsError> {
        self.inner
            .get_community_channel_message_references(
                Uuid::from_str(&community_id).unwrap(),
                Uuid::from_str(&channel_id).unwrap(),
                options.inner,
            )
            .await
            .map_err(|e| e.into())
            .map(|s| AsyncIterator::new(Box::pin(s.map(|t| MessageReference::new(t).into()))))
    }
    pub async fn community_channel_message_status(
        &self,
        community_id: String,
        channel_id: String,
        message_id: String,
    ) -> Result<MessageStatus, JsError> {
        self.inner
            .community_channel_message_status(
                Uuid::from_str(&community_id).unwrap(),
                Uuid::from_str(&channel_id).unwrap(),
                Uuid::from_str(&message_id).unwrap(),
            )
            .await
            .map_err(|e| e.into())
            .map(|status| status.into())
    }
    pub async fn send_community_channel_message(
        &mut self,
        community_id: String,
        channel_id: String,
        message: Vec<String>,
    ) -> Result<String, JsError> {
        self.inner
            .send_community_channel_message(
                Uuid::from_str(&community_id).unwrap(),
                Uuid::from_str(&channel_id).unwrap(),
                message,
            )
            .await
            .map_err(|e| e.into())
            .map(|id| id.to_string())
    }
    pub async fn edit_community_channel_message(
        &mut self,
        community_id: String,
        channel_id: String,
        message_id: String,
        message: Vec<String>,
    ) -> Result<(), JsError> {
        self.inner
            .edit_community_channel_message(
                Uuid::from_str(&community_id).unwrap(),
                Uuid::from_str(&channel_id).unwrap(),
                Uuid::from_str(&message_id).unwrap(),
                message,
            )
            .await
            .map_err(|e| e.into())
    }
    pub async fn reply_to_community_channel_message(
        &mut self,
        community_id: String,
        channel_id: String,
        message_id: String,
        message: Vec<String>,
    ) -> Result<String, JsError> {
        self.inner
            .reply_to_community_channel_message(
                Uuid::from_str(&community_id).unwrap(),
                Uuid::from_str(&channel_id).unwrap(),
                Uuid::from_str(&message_id).unwrap(),
                message,
            )
            .await
            .map_err(|e| e.into())
            .map(|id| id.to_string())
    }
    pub async fn delete_community_channel_message(
        &mut self,
        community_id: String,
        channel_id: String,
        message_id: String,
    ) -> Result<(), JsError> {
        self.inner
            .delete_community_channel_message(
                Uuid::from_str(&community_id).unwrap(),
                Uuid::from_str(&channel_id).unwrap(),
                Uuid::from_str(&message_id).unwrap(),
            )
            .await
            .map_err(|e| e.into())
    }
    pub async fn pin_community_channel_message(
        &mut self,
        community_id: String,
        channel_id: String,
        message_id: String,
        state: PinState,
    ) -> Result<(), JsError> {
        self.inner
            .pin_community_channel_message(
                Uuid::from_str(&community_id).unwrap(),
                Uuid::from_str(&channel_id).unwrap(),
                Uuid::from_str(&message_id).unwrap(),
                state.into(),
            )
            .await
            .map_err(|e| e.into())
    }
    pub async fn react_to_community_channel_message(
        &mut self,
        community_id: String,
        channel_id: String,
        message_id: String,
        state: ReactionState,
        emoji: String,
    ) -> Result<(), JsError> {
        self.inner
            .react_to_community_channel_message(
                Uuid::from_str(&community_id).unwrap(),
                Uuid::from_str(&channel_id).unwrap(),
                Uuid::from_str(&message_id).unwrap(),
                state.into(),
                emoji,
            )
            .await
            .map_err(|e| e.into())
    }
    pub async fn send_community_channel_messsage_event(
        &mut self,
        community_id: String,
        channel_id: String,
        event: MessageEvent,
    ) -> Result<(), JsError> {
        self.inner
            .send_community_channel_messsage_event(
                Uuid::from_str(&community_id).unwrap(),
                Uuid::from_str(&channel_id).unwrap(),
                event.into(),
            )
            .await
            .map_err(|e| e.into())
    }
    pub async fn cancel_community_channel_messsage_event(
        &mut self,
        community_id: String,
        channel_id: String,
        event: MessageEvent,
    ) -> Result<(), JsError> {
        self.inner
            .cancel_community_channel_messsage_event(
                Uuid::from_str(&community_id).unwrap(),
                Uuid::from_str(&channel_id).unwrap(),
                event.into(),
            )
            .await
            .map_err(|e| e.into())
    }
    pub async fn attach_to_community_channel_message(
        &mut self,
        community_id: String,
        channel_id: String,
        message_id: Option<String>,
        files: Vec<AttachmentFile>,
        message: Vec<String>,
    ) -> Result<AttachmentResult, JsError> {
        self.inner
            .attach_to_community_channel_message(
                Uuid::from_str(&community_id).unwrap(),
                Uuid::from_str(&channel_id).unwrap(),
                message_id.map(|id| Uuid::from_str(&id).unwrap()),
                files.into_iter().map(|f| f.into()).collect(),
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
    pub async fn download_stream_from_community_channel_message(
        &self,
        community_id: String,
        channel_id: String,
        message_id: String,
        file: String,
    ) -> Result<AsyncIterator, JsError> {
        self.inner
            .download_stream_from_community_channel_message(
                Uuid::from_str(&community_id).unwrap(),
                Uuid::from_str(&channel_id).unwrap(),
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
        self.inner.name().map(|s| s.to_string())
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
    /// Get the permissions for this group.
    /// Modifications on this struct are NOT reflected on the conversation. You need to set them again
    pub fn permissions(&self) -> GroupPermissions {
        GroupPermissions(self.inner.permissions().clone())
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
    messages: Option<Vec<raygun::Message>>,
    stream: Option<AsyncIterator>,
    pages: Option<(Vec<raygun::MessagePage>, usize)>,
}

#[wasm_bindgen]
impl Messages {
    fn new(messages: raygun::Messages) -> Self {
        match messages {
            raygun::Messages::List(list) => Self {
                variant: MessagesEnum::List,
                messages: Some(list),
                stream: None,
                pages: None,
            },
            raygun::Messages::Stream(stream) => Self {
                variant: MessagesEnum::Stream,
                messages: None,
                stream: Some(
                    AsyncIterator::new(Box::pin(stream.map(|s| Message::new(s).into()))).into(),
                ),
                pages: None,
            },
            raygun::Messages::Page { pages, total } => Self {
                variant: MessagesEnum::Page,
                messages: None,
                stream: None,
                pages: Some((pages, total)),
            },
        }
    }
    /// The variant of this message struct
    /// Depending on the variant the other functions will return undefined or not
    pub fn variant(&self) -> MessagesEnum {
        self.variant
    }
    /// Return the list of messages if its a list variant
    pub fn messages(&self) -> Option<Vec<Message>> {
        if let Some(list) = &self.messages {
            Some(list.iter().map(|m| Message::new(m.clone())).collect())
        } else {
            None
        }
    }
    /// Return the next element of the stream if this is a stream variant
    pub async fn next_stream(&mut self) -> std::result::Result<Promise, JsError> {
        if let Some(s) = self.stream.as_mut() {
            return s.next().await;
        }
        Err(JsError::new("Not a stream"))
    }
    /// Return the page if its a page variant
    pub fn page(&self) -> Option<Page> {
        if let Some((pages, total)) = &self.pages {
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
            Some(Page {
                pages,
                total: *total,
            })
        } else {
            None
        }
    }
}
#[derive(Serialize, Deserialize)]
#[wasm_bindgen]
pub struct Page {
    pages: Vec<MessagePage>,
    pub total: usize,
}
#[wasm_bindgen]
impl Page {
    pub fn get_pages_content(&self) -> Vec<MessagePage> {
        self.pages.clone()
    }
}
#[derive(Serialize, Deserialize, Clone)]
#[wasm_bindgen]
pub struct MessagePage {
    pub id: usize,
    messages: Vec<Message>,
    pub total: usize,
}
#[wasm_bindgen]
impl MessagePage {
    pub fn get_messages(&self) -> Vec<Message> {
        self.messages.clone()
    }
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
        self.inner = self.inner.clone().set_date_range(core::ops::Range {
            start: start.into(),
            end: end.into(),
        });
    }

    pub fn set_range(&mut self, start: usize, end: usize) {
        self.inner = self
            .inner
            .clone()
            .set_range(core::ops::Range { start, end });
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
        self.inner = self.inner.clone().set_messages_type(ty.into());
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
#[derive(Serialize, Deserialize, Clone)]
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
        self.inner.lines().to_vec()
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
impl From<AttachmentFile> for raygun::Location {
    fn from(value: AttachmentFile) -> Self {
        if let Some(attachment) = value.stream {
            Location::Stream {
                name: value.file,
                size: attachment.size,
                stream: {
                    let stream = InnerStream::from(wasm_streams::ReadableStream::from_raw(
                        attachment.stream,
                    ));
                    Box::pin(stream)
                },
            }
        } else {
            Location::Constellation { path: value.file }
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
    // Vec of enums dont get converted to arrays of that type
    #[wasm_bindgen(typescript_type = "GroupPermission[]")]
    pub type GroupPermissionList;
}

#[derive(Debug, Clone, PartialEq, Eq)]
#[wasm_bindgen]
pub enum GroupPermission {
    AddParticipants,
    RemoveParticipants,
    EditGroupInfo,
    EditGroupImages,
}

impl From<GroupPermission> for warp::raygun::GroupPermission {
    fn from(value: GroupPermission) -> Self {
        match value {
            GroupPermission::AddParticipants => warp::raygun::GroupPermission::AddParticipants,
            GroupPermission::RemoveParticipants => {
                warp::raygun::GroupPermission::RemoveParticipants
            }
            GroupPermission::EditGroupInfo => warp::raygun::GroupPermission::EditGroupInfo,
            GroupPermission::EditGroupImages => warp::raygun::GroupPermission::EditGroupImages,
        }
    }
}

impl From<warp::raygun::GroupPermission> for GroupPermission {
    fn from(value: warp::raygun::GroupPermission) -> Self {
        match value {
            warp::raygun::GroupPermission::AddParticipants => GroupPermission::AddParticipants,
            warp::raygun::GroupPermission::RemoveParticipants => {
                GroupPermission::RemoveParticipants
            }
            warp::raygun::GroupPermission::EditGroupInfo => GroupPermission::EditGroupInfo,
            warp::raygun::GroupPermission::EditGroupImages => GroupPermission::EditGroupImages,
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
        permissions: GroupPermissionList,
    ) -> Result<(), JsError> {
        let did = DID::from_str(&did)?;
        let permissions: js_sys::Array = js_sys::Array::from(&permissions);
        let permissions: IndexSet<warp::raygun::GroupPermission> = permissions
            .into_iter()
            .map(|p| GroupPermission::try_from_js_value(p).unwrap().into())
            .collect();
        self.0.insert(did, permissions);
        Ok(())
    }
    pub fn get_permissions(&self, did: String) -> Result<Option<GroupPermissionList>, JsError> {
        let result = self.0.get(&DID::from_str(&did)?);
        let result = result.map(|s| {
            Array::from_iter(
                s.into_iter()
                    .map(|p| GroupPermission::from(*p).into())
                    .collect::<Vec<JsValue>>(),
            )
        });
        let result = result.map(|v| GroupPermissionList::unchecked_from_js(v.into()));
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

#[wasm_bindgen]
impl ConversationImage {
    pub fn data(&self) -> Vec<u8> {
        self.0.data().to_vec()
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

impl From<MessagesType> for raygun::MessagesType {
    fn from(value: MessagesType) -> Self {
        match value {
            MessagesType::Stream => raygun::MessagesType::Stream,
            MessagesType::List => raygun::MessagesType::List,
            MessagesType::Pages {
                page,
                amount_per_page,
            } => raygun::MessagesType::Pages {
                page,
                amount_per_page,
            },
        }
    }
}

#[derive(Serialize, Deserialize)]
#[wasm_bindgen]
pub struct Community {
    inner: raygun::community::Community,
}

#[wasm_bindgen]
pub struct CommunityInvitation {
    #[wasm_bindgen(readonly, getter_with_clone)]
    pub community: String,
    #[wasm_bindgen(readonly, getter_with_clone)]
    pub invite: CommunityInvite,
}

#[derive(Clone)]
#[wasm_bindgen]
pub struct CommunityInvite {
    #[wasm_bindgen(getter_with_clone)]
    pub id: String,
    #[wasm_bindgen(getter_with_clone)]
    pub target_user: Option<String>,
    #[wasm_bindgen(getter_with_clone)]
    pub created: js_sys::Date,
    #[wasm_bindgen(getter_with_clone)]
    pub expiry: Option<js_sys::Date>,
}

impl From<raygun::community::CommunityInvite> for CommunityInvite {
    fn from(value: raygun::community::CommunityInvite) -> Self {
        CommunityInvite {
            id: value.id().into(),
            target_user: value.target_user().map(|u| u.to_string()),
            created: value.created().into(),
            expiry: value.expiry().map(|d| d.into()),
        }
    }
}

impl From<CommunityInvite> for raygun::community::CommunityInvite {
    fn from(value: CommunityInvite) -> Self {
        let mut community_invite = raygun::community::CommunityInvite::default();
        community_invite.set_id(Uuid::from_str(&value.id).unwrap());
        community_invite
            .set_target_user(value.target_user.map(|user| DID::from_str(&user).unwrap()));
        community_invite.set_created(value.created.into());
        community_invite.set_expiry(value.expiry.map(|d| d.into()));
        community_invite
    }
}

#[derive(Serialize, Deserialize)]
#[wasm_bindgen]
pub struct CommunityRole {
    #[wasm_bindgen(readonly, getter_with_clone)]
    pub id: String,
    #[wasm_bindgen(readonly, getter_with_clone)]
    pub name: String,
    #[wasm_bindgen(readonly, getter_with_clone)]
    pub members: Vec<String>,
}

impl From<raygun::community::CommunityRole> for CommunityRole {
    fn from(value: raygun::community::CommunityRole) -> Self {
        CommunityRole {
            id: value.id().to_string(),
            name: value.name().to_string(),
            members: value.members().iter().map(|id| id.to_string()).collect(),
        }
    }
}
#[derive(Serialize, Deserialize)]
#[wasm_bindgen]
pub struct CommunityChannel {
    inner: raygun::community::CommunityChannel,
}

#[wasm_bindgen]
pub enum CommunityChannelType {
    Standard,
    VoiceEnabled,
}

impl From<CommunityChannelType> for raygun::community::CommunityChannelType {
    fn from(value: CommunityChannelType) -> Self {
        match value {
            CommunityChannelType::Standard => raygun::community::CommunityChannelType::Standard,
            CommunityChannelType::VoiceEnabled => {
                raygun::community::CommunityChannelType::VoiceEnabled
            }
        }
    }
}

#[wasm_bindgen]
pub enum CommunityPermission {
    EditName,
    EditDescription,
    EditIcon,
    EditBanner,

    CreateRoles,
    EditRoles,
    DeleteRoles,

    GrantRoles,
    RevokeRoles,

    GrantPermissions,
    RevokePermissions,

    CreateInvites,
    EditInvites,
    DeleteInvites,

    CreateChannels,
    EditChannels,
    DeleteChannels,

    RemoveMembers,

    DeleteMessages,
    PinMessages,
}

impl From<CommunityPermission> for raygun::community::CommunityPermission {
    fn from(value: CommunityPermission) -> Self {
        match value {
            CommunityPermission::EditName => raygun::community::CommunityPermission::EditName,
            CommunityPermission::EditDescription => {
                raygun::community::CommunityPermission::EditDescription
            }
            CommunityPermission::EditIcon => raygun::community::CommunityPermission::EditIcon,
            CommunityPermission::EditBanner => raygun::community::CommunityPermission::EditBanner,
            CommunityPermission::CreateRoles => raygun::community::CommunityPermission::CreateRoles,
            CommunityPermission::EditRoles => raygun::community::CommunityPermission::EditRoles,
            CommunityPermission::DeleteRoles => raygun::community::CommunityPermission::DeleteRoles,
            CommunityPermission::GrantRoles => raygun::community::CommunityPermission::GrantRoles,
            CommunityPermission::RevokeRoles => raygun::community::CommunityPermission::RevokeRoles,
            CommunityPermission::GrantPermissions => {
                raygun::community::CommunityPermission::GrantPermissions
            }
            CommunityPermission::RevokePermissions => {
                raygun::community::CommunityPermission::RevokePermissions
            }
            CommunityPermission::CreateInvites => {
                raygun::community::CommunityPermission::CreateInvites
            }
            CommunityPermission::EditInvites => raygun::community::CommunityPermission::EditInvites,
            CommunityPermission::DeleteInvites => {
                raygun::community::CommunityPermission::DeleteInvites
            }
            CommunityPermission::CreateChannels => {
                raygun::community::CommunityPermission::CreateChannels
            }
            CommunityPermission::EditChannels => {
                raygun::community::CommunityPermission::EditChannels
            }
            CommunityPermission::DeleteChannels => {
                raygun::community::CommunityPermission::DeleteChannels
            }
            CommunityPermission::RemoveMembers => {
                raygun::community::CommunityPermission::RemoveMembers
            }
            CommunityPermission::DeleteMessages => {
                raygun::community::CommunityPermission::DeleteMessages
            }
            CommunityPermission::PinMessages => raygun::community::CommunityPermission::PinMessages,
        }
    }
}

#[wasm_bindgen]
pub enum CommunityChannelPermission {
    ViewChannel,
    SendMessages,
    SendAttachments,
}

impl From<CommunityChannelPermission> for raygun::community::CommunityChannelPermission {
    fn from(value: CommunityChannelPermission) -> Self {
        match value {
            CommunityChannelPermission::ViewChannel => {
                raygun::community::CommunityChannelPermission::ViewChannel
            }
            CommunityChannelPermission::SendMessages => {
                raygun::community::CommunityChannelPermission::SendMessages
            }
            CommunityChannelPermission::SendAttachments => {
                raygun::community::CommunityChannelPermission::SendAttachments
            }
        }
    }
}
