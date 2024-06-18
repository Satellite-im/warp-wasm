/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export function __wbg_warpipfs_free(a: number): void;
export function warpipfs_new_wasm(a: number, b: number): number;
export function __wbg_config_free(a: number): void;
export function config_development(): number;
export function config_testing(): number;
export function config_minimal_testing(): number;
export function config_minimal_basic(): number;
export function config_minimal_with_relay(a: number, b: number): number;
export function __wbg_hash_free(a: number): void;
export function __wbg_constellationbox_free(a: number): void;
export function constellationbox_modified(a: number): number;
export function constellationbox_root_directory(a: number): number;
export function constellationbox_current_size(a: number): number;
export function constellationbox_max_size(a: number): number;
export function constellationbox_select(a: number, b: number, c: number, d: number): void;
export function constellationbox_set_path(a: number, b: number, c: number): void;
export function constellationbox_get_path(a: number, b: number): void;
export function constellationbox_go_back(a: number, b: number): void;
export function constellationbox_current_directory(a: number, b: number): void;
export function constellationbox_open_directory(a: number, b: number, c: number, d: number): void;
export function constellationbox_put_buffer(a: number, b: number, c: number, d: number, e: number): number;
export function constellationbox_get_buffer(a: number, b: number, c: number): number;
export function constellationbox_put_stream(a: number, b: number, c: number, d: number, e: number, f: number): number;
export function constellationbox_get_stream(a: number, b: number, c: number): number;
export function constellationbox_rename(a: number, b: number, c: number, d: number, e: number): number;
export function constellationbox_remove(a: number, b: number, c: number, d: number): number;
export function constellationbox_move_item(a: number, b: number, c: number, d: number, e: number): number;
export function constellationbox_create_directory(a: number, b: number, c: number, d: number): number;
export function constellationbox_sync_ref(a: number, b: number, c: number): number;
export function __wbg_directory_free(a: number): void;
export function directory_new(a: number, b: number): number;
export function directory_has_item(a: number, b: number, c: number): number;
export function directory_add_file(a: number, b: number, c: number): void;
export function directory_add_directory(a: number, b: number, c: number): void;
export function directory_get_item_index(a: number, b: number, c: number, d: number): void;
export function directory_rename_item(a: number, b: number, c: number, d: number, e: number, f: number): void;
export function directory_remove_item(a: number, b: number, c: number, d: number): void;
export function directory_remove_item_from_path(a: number, b: number, c: number, d: number, e: number, f: number): void;
export function directory_move_item_to(a: number, b: number, c: number, d: number, e: number, f: number): void;
export function directory_get_items(a: number, b: number): void;
export function directory_set_items(a: number, b: number, c: number): void;
export function directory_add_item(a: number, b: number, c: number): void;
export function directory_get_item(a: number, b: number, c: number, d: number): void;
export function directory_find_item(a: number, b: number, c: number, d: number): void;
export function directory_find_all_items(a: number, b: number, c: number, d: number): void;
export function directory_get_last_directory_from_path(a: number, b: number, c: number, d: number): void;
export function directory_get_item_by_path(a: number, b: number, c: number, d: number): void;
export function directory_name(a: number, b: number): void;
export function directory_set_name(a: number, b: number, c: number): void;
export function directory_set_thumbnail_format(a: number, b: number): void;
export function directory_thumbnail_format(a: number): number;
export function directory_set_thumbnail(a: number, b: number, c: number): void;
export function directory_thumbnail(a: number, b: number): void;
export function directory_set_thumbnail_reference(a: number, b: number, c: number): void;
export function directory_thumbnail_reference(a: number, b: number): void;
export function directory_set_favorite(a: number, b: number): void;
export function directory_favorite(a: number): number;
export function directory_description(a: number, b: number): void;
export function directory_set_description(a: number, b: number, c: number): void;
export function directory_size(a: number): number;
export function directory_set_creation(a: number, b: number): void;
export function directory_set_modified(a: number, b: number): void;
export function directory_path(a: number, b: number): void;
export function directory_set_path(a: number, b: number, c: number): void;
export function directory_id(a: number, b: number): void;
export function directory_creation(a: number): number;
export function directory_modified(a: number): number;
export function __wbg_file_free(a: number): void;
export function file_new(a: number, b: number): number;
export function file_set_id(a: number, b: number, c: number): void;
export function file_set_name(a: number, b: number, c: number): void;
export function file_description(a: number, b: number): void;
export function file_set_description(a: number, b: number, c: number): void;
export function file_set_thumbnail_format(a: number, b: number): void;
export function file_thumbnail_format(a: number): number;
export function file_set_thumbnail(a: number, b: number, c: number): void;
export function file_thumbnail(a: number, b: number): void;
export function file_set_favorite(a: number, b: number): void;
export function file_set_reference(a: number, b: number, c: number): void;
export function file_set_thumbnail_reference(a: number, b: number, c: number): void;
export function file_reference(a: number, b: number): void;
export function file_size(a: number): number;
export function file_set_size(a: number, b: number): void;
export function file_set_creation(a: number, b: number): void;
export function file_set_modified(a: number, b: number): void;
export function file_hash(a: number): number;
export function file_set_hash(a: number, b: number): void;
export function file_set_file_type(a: number, b: number): void;
export function file_file_type(a: number): number;
export function file_path(a: number, b: number): void;
export function file_set_path(a: number, b: number, c: number): void;
export function file_id(a: number, b: number): void;
export function file_modified(a: number): number;
export function __wbg_item_free(a: number): void;
export function item_new_file(a: number): number;
export function item_new_directory(a: number): number;
export function item_file(a: number): number;
export function item_directory(a: number): number;
export function item_id(a: number, b: number): void;
export function item_creation(a: number): number;
export function item_modified(a: number): number;
export function item_name(a: number, b: number): void;
export function item_description(a: number, b: number): void;
export function item_size(a: number): number;
export function item_thumbnail_format(a: number): number;
export function item_thumbnail(a: number, b: number): void;
export function item_favorite(a: number): number;
export function item_set_favorite(a: number, b: number): void;
export function item_rename(a: number, b: number, c: number, d: number): void;
export function item_is_directory(a: number): number;
export function item_is_file(a: number): number;
export function item_set_description(a: number, b: number, c: number): void;
export function item_set_thumbnail(a: number, b: number, c: number): void;
export function item_set_thumbnail_format(a: number, b: number): void;
export function item_set_size(a: number, b: number, c: number): void;
export function item_path(a: number, b: number): void;
export function item_set_path(a: number, b: number, c: number): void;
export function item_get_directory(a: number, b: number): void;
export function item_get_file(a: number, b: number): void;
export function file_name(a: number, b: number): void;
export function file_favorite(a: number): number;
export function file_creation(a: number): number;
export function file_thumbnail_reference(a: number, b: number): void;
export function item_item_type(a: number): number;
export function __wbg_groupsettings_free(a: number): void;
export function groupsettings_members_can_add_participants(a: number): number;
export function groupsettings_members_can_change_name(a: number): number;
export function groupsettings_set_members_can_add_participants(a: number, b: number): void;
export function groupsettings_set_members_can_change_name(a: number, b: number): void;
export function __wbg_asynciterator_free(a: number): void;
export function asynciterator_next(a: number): number;
export function __wbg_promiseresult_free(a: number): void;
export function __wbg_get_promiseresult_done(a: number): number;
export function __wbg_set_promiseresult_done(a: number, b: number): void;
export function promiseresult_new(a: number): number;
export function promiseresult_value(a: number): number;
export function __wbg_warpinstance_free(a: number): void;
export function warpinstance_multipass(a: number): number;
export function warpinstance_raygun(a: number): number;
export function warpinstance_constellation(a: number): number;
export function initialize(): void;
export function __wbg_directconversationsettings_free(a: number): void;
export function __wbg_identityprofile_free(a: number): void;
export function identityprofile_new(a: number, b: number, c: number): number;
export function identityprofile_identity(a: number): number;
export function identityprofile_set_identity(a: number, b: number): void;
export function identityprofile_passphrase(a: number, b: number): void;
export function __wbg_identity_free(a: number): void;
export function identity_set_username(a: number, b: number, c: number): void;
export function identity_set_status_message(a: number, b: number, c: number): void;
export function identity_set_short_id(a: number, b: number, c: number): void;
export function identity_set_did_key(a: number, b: number, c: number): void;
export function identity_set_created(a: number, b: number): void;
export function identity_set_modified(a: number, b: number): void;
export function identity_username(a: number, b: number): void;
export function identity_status_message(a: number, b: number): void;
export function identity_short_id(a: number, b: number): void;
export function identity_did_key(a: number, b: number): void;
export function identity_created(a: number): number;
export function identity_modified(a: number): number;
export function __wbg_multipassbox_free(a: number): void;
export function multipassbox_create_identity(a: number, b: number, c: number, d: number, e: number): number;
export function multipassbox_get_identity(a: number, b: number, c: number): number;
export function multipassbox_identity(a: number): number;
export function multipassbox_tesseract(a: number): number;
export function multipassbox_update_identity(a: number, b: number, c: number): number;
export function multipassbox_multipass_subscribe(a: number): number;
export function multipassbox_send_request(a: number, b: number, c: number): number;
export function multipassbox_accept_request(a: number, b: number, c: number): number;
export function multipassbox_deny_request(a: number, b: number, c: number): number;
export function multipassbox_close_request(a: number, b: number, c: number): number;
export function multipassbox_received_friend_request_from(a: number, b: number, c: number): number;
export function multipassbox_list_incoming_request(a: number): number;
export function multipassbox_sent_friend_request_to(a: number, b: number, c: number): number;
export function multipassbox_list_outgoing_request(a: number): number;
export function multipassbox_remove_friend(a: number, b: number, c: number): number;
export function multipassbox_block(a: number, b: number, c: number): number;
export function multipassbox_unblock(a: number, b: number, c: number): number;
export function multipassbox_block_list(a: number): number;
export function multipassbox_is_blocked(a: number, b: number, c: number): number;
export function multipassbox_list_friends(a: number): number;
export function multipassbox_has_friend(a: number, b: number, c: number): number;
export function __wbg_multipasseventkind_free(a: number): void;
export function multipasseventkind_kind(a: number): number;
export function multipasseventkind_did(a: number, b: number): void;
export function generate_name(a: number): void;
export function __wbg_raygunbox_free(a: number): void;
export function raygunbox_create_conversation(a: number, b: number, c: number): number;
export function raygunbox_create_group_conversation(a: number, b: number, c: number, d: number, e: number, f: number): number;
export function raygunbox_get_conversation(a: number, b: number, c: number): number;
export function raygunbox_set_favorite_conversation(a: number, b: number, c: number, d: number): number;
export function raygunbox_list_conversations(a: number): number;
export function raygunbox_get_message(a: number, b: number, c: number, d: number, e: number): number;
export function raygunbox_get_message_count(a: number, b: number, c: number): number;
export function raygunbox_message_status(a: number, b: number, c: number, d: number, e: number): number;
export function raygunbox_get_message_references(a: number, b: number, c: number, d: number): number;
export function raygunbox_get_message_reference(a: number, b: number, c: number, d: number, e: number): number;
export function raygunbox_get_messages(a: number, b: number, c: number, d: number): number;
export function raygunbox_send(a: number, b: number, c: number, d: number, e: number): number;
export function raygunbox_edit(a: number, b: number, c: number, d: number, e: number, f: number, g: number): number;
export function raygunbox_delete(a: number, b: number, c: number, d: number, e: number): number;
export function raygunbox_react(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number): number;
export function raygunbox_pin(a: number, b: number, c: number, d: number, e: number, f: number): number;
export function raygunbox_reply(a: number, b: number, c: number, d: number, e: number, f: number, g: number): number;
export function raygunbox_embeds(a: number, b: number, c: number, d: number, e: number, f: number): number;
export function raygunbox_update_conversation_settings(a: number, b: number, c: number, d: number): number;
export function raygunbox_update_conversation_name(a: number, b: number, c: number, d: number, e: number): number;
export function raygunbox_add_recipient(a: number, b: number, c: number, d: number, e: number): number;
export function raygunbox_remove_recipient(a: number, b: number, c: number, d: number, e: number): number;
export function raygunbox_attach(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number): number;
export function raygunbox_download_stream(a: number, b: number, c: number, d: number, e: number, f: number, g: number): number;
export function raygunbox_get_conversation_stream(a: number, b: number, c: number): number;
export function raygunbox_raygun_subscribe(a: number): number;
export function raygunbox_send_event(a: number, b: number, c: number, d: number): number;
export function raygunbox_cancel_event(a: number, b: number, c: number, d: number): number;
export function __wbg_conversation_free(a: number): void;
export function conversation_id(a: number, b: number): void;
export function conversation_name(a: number, b: number): void;
export function conversation_creator(a: number, b: number): void;
export function conversation_created(a: number): number;
export function conversation_modified(a: number): number;
export function conversation_settings(a: number): number;
export function conversation_recipients(a: number, b: number): void;
export function __wbg_messages_free(a: number): void;
export function messages_variant(a: number): number;
export function messages_value(a: number): number;
export function __wbg_messageoptions_free(a: number): void;
export function messageoptions_new(): number;
export function messageoptions_set_date_range(a: number, b: number): void;
export function messageoptions_set_range(a: number, b: number): void;
export function messageoptions_set_limit(a: number, b: number): void;
export function messageoptions_set_skip(a: number, b: number): void;
export function messageoptions_set_keyword(a: number, b: number, c: number): void;
export function messageoptions_set_first_message(a: number): void;
export function messageoptions_set_last_message(a: number): void;
export function messageoptions_set_pinned(a: number): void;
export function messageoptions_set_reverse(a: number): void;
export function messageoptions_set_messages_type(a: number, b: number): void;
export function __wbg_messagereference_free(a: number): void;
export function messagereference_id(a: number, b: number): void;
export function messagereference_conversation_id(a: number, b: number): void;
export function messagereference_sender(a: number, b: number): void;
export function messagereference_date(a: number): number;
export function messagereference_modified(a: number): number;
export function messagereference_pinned(a: number): number;
export function messagereference_replied(a: number, b: number): void;
export function messagereference_deleted(a: number): number;
export function __wbg_message_free(a: number): void;
export function message_id(a: number, b: number): void;
export function message_message_type(a: number): number;
export function message_conversation_id(a: number, b: number): void;
export function message_sender(a: number, b: number): void;
export function message_date(a: number): number;
export function message_modified(a: number): number;
export function message_pinned(a: number): number;
export function message_reactions(a: number): number;
export function message_mentions(a: number, b: number): void;
export function message_lines(a: number, b: number): void;
export function message_attachments(a: number): number;
export function message_metadata(a: number): number;
export function message_replied(a: number, b: number): void;
export function __wbg_attachmentfile_free(a: number): void;
export function attachmentfile_new(a: number, b: number, c: number): number;
export function __wbg_attachmentresult_free(a: number): void;
export function attachmentresult_get_file(a: number, b: number): void;
export function attachmentresult_next(a: number): number;
export function __wbg_tesseract_free(a: number): void;
export function tesseract_new(): number;
export function tesseract_set_autosave(a: number): void;
export function tesseract_autosave_enabled(a: number): number;
export function tesseract_disable_key_check(a: number): void;
export function tesseract_enable_key_check(a: number): void;
export function tesseract_is_key_check_enabled(a: number): number;
export function tesseract_exist(a: number, b: number, c: number): number;
export function tesseract_clear(a: number): void;
export function tesseract_is_unlock(a: number): number;
export function tesseract_lock(a: number): void;
export function tesseract_set(a: number, b: number, c: number, d: number, e: number, f: number): void;
export function tesseract_retrieve(a: number, b: number, c: number, d: number): void;
export function tesseract_update_unlock(a: number, b: number, c: number, d: number, e: number, f: number): void;
export function tesseract__delete(a: number, b: number, c: number, d: number): void;
export function tesseract_unlock(a: number, b: number, c: number, d: number): void;
export function tesseract_save(a: number, b: number): void;
export function tesseract_subscribe(a: number): number;
export function tesseract_load_from_storage(a: number, b: number): void;
export function __wbg_intounderlyingsource_free(a: number): void;
export function intounderlyingsource_pull(a: number, b: number): number;
export function intounderlyingsource_cancel(a: number): void;
export function __wbg_intounderlyingbytesource_free(a: number): void;
export function intounderlyingbytesource_type(a: number, b: number): void;
export function intounderlyingbytesource_autoAllocateChunkSize(a: number): number;
export function intounderlyingbytesource_start(a: number, b: number): void;
export function intounderlyingbytesource_pull(a: number, b: number): number;
export function intounderlyingbytesource_cancel(a: number): void;
export function __wbg_intounderlyingsink_free(a: number): void;
export function intounderlyingsink_write(a: number, b: number): number;
export function intounderlyingsink_close(a: number): number;
export function intounderlyingsink_abort(a: number, b: number): number;
export function __wbindgen_malloc(a: number, b: number): number;
export function __wbindgen_realloc(a: number, b: number, c: number, d: number): number;
export const __wbindgen_export_2: WebAssembly.Table;
export function wasm_bindgen__convert__closures__invoke1_mut__hadcd974251a5a328(a: number, b: number, c: number): void;
export function wasm_bindgen__convert__closures__invoke1_mut__hb5a2d032974abeff(a: number, b: number, c: number): void;
export function wasm_bindgen__convert__closures__invoke0_mut__he120708a7692d5b4(a: number, b: number): void;
export function _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h3beff7ac42f30698(a: number, b: number, c: number): void;
export function _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h91fdae060fad7c36(a: number, b: number, c: number): void;
export function wasm_bindgen__convert__closures__invoke1_mut__h1b037a17eb910527(a: number, b: number, c: number): void;
export function _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h8c5bca55bd21737b(a: number, b: number, c: number): void;
export function _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__heefe87c8e0fb482a(a: number, b: number, c: number): void;
export function wasm_bindgen__convert__closures__invoke0_mut__hb78a60c7f34cf8d9(a: number, b: number): void;
export function __wbindgen_add_to_stack_pointer(a: number): number;
export function __wbindgen_free(a: number, b: number, c: number): void;
export function __wbindgen_exn_store(a: number): void;
export function wasm_bindgen__convert__closures__invoke2_mut__h78ef80c4d5e3ad7c(a: number, b: number, c: number, d: number): void;
export function __wbindgen_start(): void;
