/* tslint:disable */
/* eslint-disable */
/**
* Used to generate a random user name
*
* # Example
*
* ```
* use warp::multipass::generator;
* let name = generator::generate_name();
*
* assert!(name.len() <= 32);
* ```
* @returns {string}
*/
export function generate_name(): string;
/**
*/
export enum IdentityUpdate {
  Username = 0,
  Picture = 1,
  PicturePath = 2,
  PictureStream = 3,
  ClearPicture = 4,
  Banner = 5,
  BannerPath = 6,
  BannerStream = 7,
  ClearBanner = 8,
  StatusMessage = 9,
  ClearStatusMessage = 10,
}
/**
*/
export enum TesseractEvent {
  Unlocked = 0,
  Locked = 1,
}
/**
*/
export enum Identifier {
  DID = 0,
  DIDList = 1,
  Username = 2,
  Own = 3,
}
/**
*/
export enum MultiPassEventKindEnum {
  FriendRequestReceived = 0,
  FriendRequestSent = 1,
  IncomingFriendRequestRejected = 2,
  OutgoingFriendRequestRejected = 3,
  IncomingFriendRequestClosed = 4,
  OutgoingFriendRequestClosed = 5,
  FriendAdded = 6,
  FriendRemoved = 7,
  IdentityOnline = 8,
  IdentityOffline = 9,
  IdentityUpdate = 10,
  Blocked = 11,
  BlockedBy = 12,
  Unblocked = 13,
  UnblockedBy = 14,
}
/**
* Wraps BoxStream<'static, TesseractEvent> into a js compatible struct
*/
export class AsyncIterator {
  free(): void;
/**
* @returns {Promise<Promise<any>>}
*/
  next(): Promise<Promise<any>>;
}
/**
*/
export class Config {
  free(): void;
/**
* Default configuration for local development and writing test
* @returns {Config}
*/
  static development(): Config;
/**
* Test configuration. Used for in-memory
* @returns {Config}
*/
  static testing(): Config;
/**
* Minimal testing configuration. Used for in-memory
* @returns {Config}
*/
  static minimal_testing(): Config;
}
/**
*/
export class ConstellationBox {
  free(): void;
}
/**
*/
export class Identity {
  free(): void;
/**
* @param {string} user
*/
  set_username(user: string): void;
/**
* @param {string | undefined} [message]
*/
  set_status_message(message?: string): void;
/**
* @param {string} id
*/
  set_short_id(id: string): void;
/**
* @param {string} pubkey
*/
  set_did_key(pubkey: string): void;
/**
* @param {Date} time
*/
  set_created(time: Date): void;
/**
* @param {Date} time
*/
  set_modified(time: Date): void;
/**
* @returns {string}
*/
  username(): string;
/**
* @returns {string | undefined}
*/
  status_message(): string | undefined;
/**
* @returns {string}
*/
  short_id(): string;
/**
* @returns {string}
*/
  did_key(): string;
/**
* @returns {Date}
*/
  created(): Date;
/**
* @returns {Date}
*/
  modified(): Date;
}
/**
* Profile containing the newly created `Identity` and a passphrase, if applicable.
*/
export class IdentityProfile {
  free(): void;
/**
* @param {Identity} identity
* @param {string | undefined} [passphrase]
* @returns {IdentityProfile}
*/
  static new(identity: Identity, passphrase?: string): IdentityProfile;
/**
* @returns {Identity}
*/
  identity(): Identity;
/**
* @param {Identity} identity
*/
  set_identity(identity: Identity): void;
/**
* @returns {string | undefined}
*/
  passphrase(): string | undefined;
}
/**
*/
export class MultiPassBox {
  free(): void;
/**
* @param {string | undefined} [username]
* @param {string | undefined} [passphrase]
* @returns {Promise<IdentityProfile>}
*/
  create_identity(username?: string, passphrase?: string): Promise<IdentityProfile>;
/**
* @param {Identifier} id_variant
* @param {any} id_value
* @returns {Promise<any>}
*/
  get_identity(id_variant: Identifier, id_value: any): Promise<any>;
/**
* @returns {Promise<Identity>}
*/
  get_own_identity(): Promise<Identity>;
/**
* @param {IdentityUpdate} option
* @param {any} value
* @returns {Promise<void>}
*/
  update_identity(option: IdentityUpdate, value: any): Promise<void>;
/**
* @returns {Promise<AsyncIterator>}
*/
  multipass_subscribe(): Promise<AsyncIterator>;
/**
* Send friend request to corresponding public key
* @param {string} pubkey
* @returns {Promise<void>}
*/
  send_request(pubkey: string): Promise<void>;
/**
* Accept friend request from public key
* @param {string} pubkey
* @returns {Promise<void>}
*/
  accept_request(pubkey: string): Promise<void>;
/**
* Deny friend request from public key
* @param {string} pubkey
* @returns {Promise<void>}
*/
  deny_request(pubkey: string): Promise<void>;
/**
* Closing or retracting friend request
* @param {string} pubkey
* @returns {Promise<void>}
*/
  close_request(pubkey: string): Promise<void>;
/**
* Check to determine if a request been received from the DID
* @param {string} pubkey
* @returns {Promise<boolean>}
*/
  received_friend_request_from(pubkey: string): Promise<boolean>;
/**
* List the incoming friend request
* @returns {Promise<any>}
*/
  list_incoming_request(): Promise<any>;
/**
* Check to determine if a request been sent to the DID
* @param {string} pubkey
* @returns {Promise<boolean>}
*/
  sent_friend_request_to(pubkey: string): Promise<boolean>;
/**
* List the outgoing friend request
* @returns {Promise<any>}
*/
  list_outgoing_request(): Promise<any>;
/**
* Remove friend from contacts
* @param {string} pubkey
* @returns {Promise<void>}
*/
  remove_friend(pubkey: string): Promise<void>;
/**
* Block public key, rather it be a friend or not, from being able to send request to account public address
* @param {string} pubkey
* @returns {Promise<void>}
*/
  block(pubkey: string): Promise<void>;
/**
* Unblock public key
* @param {string} pubkey
* @returns {Promise<void>}
*/
  unblock(pubkey: string): Promise<void>;
/**
* List block list
* @returns {Promise<any>}
*/
  block_list(): Promise<any>;
/**
* Check to see if public key is blocked
* @param {string} pubkey
* @returns {Promise<boolean>}
*/
  is_blocked(pubkey: string): Promise<boolean>;
/**
* List all friends public key
* @returns {Promise<any>}
*/
  list_friends(): Promise<any>;
/**
* Check to see if public key is friend of the account
* @param {string} pubkey
* @returns {Promise<boolean>}
*/
  has_friend(pubkey: string): Promise<boolean>;
}
/**
*/
export class MultiPassEventKind {
  free(): void;
/**
*/
  readonly did: string;
/**
*/
  readonly kind: MultiPassEventKindEnum;
}
/**
* Wraps in the TesseractEvent promise result in the js object expected by js async iterator
*/
export class PromiseResult {
  free(): void;
/**
* @param {any} value
* @returns {PromiseResult}
*/
  static new(value: any): PromiseResult;
/**
*/
  done: boolean;
/**
*/
  readonly value: any;
}
/**
*/
export class RayGunBox {
  free(): void;
}
/**
* The key store that holds encrypted strings that can be used for later use.
*/
export class Tesseract {
  free(): void;
/**
* To create an instance of Tesseract
*/
  constructor();
/**
* Enable the ability to autosave
*
* # Example
*
* ```
* let mut tesseract = warp::tesseract::Tesseract::default();
* tesseract.set_autosave();
* assert!(tesseract.autosave_enabled());
* ```
*/
  set_autosave(): void;
/**
* Check to determine if `Tesseract::autosave` is true or false
*
* # Example
*
* ```
* let mut tesseract = warp::tesseract::Tesseract::default();
* assert!(!tesseract.autosave_enabled());
* ```
* @returns {boolean}
*/
  autosave_enabled(): boolean;
/**
* Disable the key check to allow any passphrase to be used when unlocking the datastore
*
* # Example
*
* ```
* use warp::tesseract::Tesseract;
* let mut tesseract = Tesseract::default();
*
* assert!(!tesseract.is_key_check_enabled());
*
* tesseract.enable_key_check();
*
* assert!(tesseract.is_key_check_enabled());
*
* tesseract.disable_key_check();
*
* assert!(!tesseract.is_key_check_enabled());
* ```
*/
  disable_key_check(): void;
/**
* Enable the key check to allow any passphrase to be used when unlocking the datastore
*
* # Example
*
* ```
* use warp::tesseract::Tesseract;
* let mut tesseract = Tesseract::default();
*
* assert!(!tesseract.is_key_check_enabled());
*
* tesseract.enable_key_check();
*
* assert!(tesseract.is_key_check_enabled())
* ```
*/
  enable_key_check(): void;
/**
* Check to determine if the key check is enabled
*
* # Example
*
* ```
* use warp::tesseract::Tesseract;
* let mut tesseract = Tesseract::new();
* assert!(!tesseract.is_key_check_enabled());
* //TODO: Perform a check with it enabled
* ```
* @returns {boolean}
*/
  is_key_check_enabled(): boolean;
/**
* Check to see if the key store contains the key
*
* # Example
*
* ```
*  let mut tesseract = warp::tesseract::Tesseract::default();
*  tesseract.unlock(&warp::crypto::generate::<32>()).unwrap();
*  tesseract.set("API", "MYKEY").unwrap();
*  assert_eq!(tesseract.exist("API"), true);
*  assert_eq!(tesseract.exist("NOT_API"), false);
* ```
* @param {string} key
* @returns {boolean}
*/
  exist(key: string): boolean;
/**
* Used to clear the whole keystore.
*
* # Example
*
* ```
*  let mut tesseract = warp::tesseract::Tesseract::default();
*  tesseract.unlock(&warp::crypto::generate::<32>()).unwrap();
*  tesseract.set("API", "MYKEY").unwrap();
*  tesseract.clear();
*  assert_eq!(tesseract.exist("API"), false);
* ```
*/
  clear(): void;
/**
* Checks to see if tesseract is secured and not "unlocked"
*
* # Example
*
* ```
*  let mut tesseract = warp::tesseract::Tesseract::default();
*  assert!(!tesseract.is_unlock());
*  tesseract.unlock(&warp::crypto::generate::<32>()).unwrap();
*  assert!(tesseract.is_unlock());
*  tesseract.set("API", "MYKEY").unwrap();
*  tesseract.lock();
*  assert!(!tesseract.is_unlock())
* ```
* @returns {boolean}
*/
  is_unlock(): boolean;
/**
* Remove password from memory securely
*
* # Example
*
* ```
*  let mut tesseract = warp::tesseract::Tesseract::default();
*  tesseract.unlock(&warp::crypto::generate::<32>()).unwrap();
*  assert!(tesseract.is_unlock());
*  tesseract.lock();
*  assert!(!tesseract.is_unlock());
* ```
*/
  lock(): void;
/**
* @param {string} key
* @param {string} value
*/
  set(key: string, value: string): void;
/**
* @param {string} key
* @returns {string}
*/
  retrieve(key: string): string;
/**
* @param {Uint8Array} old_passphrase
* @param {Uint8Array} new_passphrase
*/
  update_unlock(old_passphrase: Uint8Array, new_passphrase: Uint8Array): void;
/**
* @param {string} key
*/
  _delete(key: string): void;
/**
* @param {Uint8Array} passphrase
*/
  unlock(passphrase: Uint8Array): void;
/**
*/
  save(): void;
/**
* @returns {AsyncIterator}
*/
  subscribe(): AsyncIterator;
/**
* Used to load contents from local storage
*/
  load_from_storage(): void;
}
/**
*/
export class WarpInstance {
  free(): void;
/**
*/
  readonly constellation: ConstellationBox;
/**
*/
  readonly multipass: MultiPassBox;
/**
*/
  readonly raygun: RayGunBox;
}
/**
*/
export class WarpIpfs {
  free(): void;
/**
* @param {Config} config
* @param {Tesseract} tesseract
*/
  constructor(config: Config, tesseract: Tesseract);
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_warpipfs_free: (a: number) => void;
  readonly warpipfs_new_wasm: (a: number, b: number) => number;
  readonly __wbg_config_free: (a: number) => void;
  readonly config_development: () => number;
  readonly config_testing: () => number;
  readonly config_minimal_testing: () => number;
  readonly __wbg_asynciterator_free: (a: number) => void;
  readonly asynciterator_next: (a: number) => number;
  readonly __wbg_promiseresult_free: (a: number) => void;
  readonly __wbg_get_promiseresult_done: (a: number) => number;
  readonly __wbg_set_promiseresult_done: (a: number, b: number) => void;
  readonly promiseresult_new: (a: number) => number;
  readonly promiseresult_value: (a: number) => number;
  readonly __wbg_warpinstance_free: (a: number) => void;
  readonly warpinstance_multipass: (a: number) => number;
  readonly warpinstance_raygun: (a: number) => number;
  readonly warpinstance_constellation: (a: number) => number;
  readonly __wbg_constellationbox_free: (a: number) => void;
  readonly __wbg_tesseract_free: (a: number) => void;
  readonly tesseract_new: () => number;
  readonly tesseract_set_autosave: (a: number) => void;
  readonly tesseract_autosave_enabled: (a: number) => number;
  readonly tesseract_disable_key_check: (a: number) => void;
  readonly tesseract_enable_key_check: (a: number) => void;
  readonly tesseract_is_key_check_enabled: (a: number) => number;
  readonly tesseract_exist: (a: number, b: number, c: number) => number;
  readonly tesseract_clear: (a: number) => void;
  readonly tesseract_is_unlock: (a: number) => number;
  readonly tesseract_lock: (a: number) => void;
  readonly tesseract_set: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly tesseract_retrieve: (a: number, b: number, c: number, d: number) => void;
  readonly tesseract_update_unlock: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly tesseract__delete: (a: number, b: number, c: number, d: number) => void;
  readonly tesseract_unlock: (a: number, b: number, c: number, d: number) => void;
  readonly tesseract_save: (a: number, b: number) => void;
  readonly tesseract_subscribe: (a: number) => number;
  readonly tesseract_load_from_storage: (a: number, b: number) => void;
  readonly generate_name: (a: number) => void;
  readonly __wbg_raygunbox_free: (a: number) => void;
  readonly __wbg_multipassbox_free: (a: number) => void;
  readonly multipassbox_create_identity: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly multipassbox_get_identity: (a: number, b: number, c: number) => number;
  readonly multipassbox_get_own_identity: (a: number) => number;
  readonly multipassbox_update_identity: (a: number, b: number, c: number) => number;
  readonly multipassbox_multipass_subscribe: (a: number) => number;
  readonly multipassbox_send_request: (a: number, b: number, c: number) => number;
  readonly multipassbox_accept_request: (a: number, b: number, c: number) => number;
  readonly multipassbox_deny_request: (a: number, b: number, c: number) => number;
  readonly multipassbox_close_request: (a: number, b: number, c: number) => number;
  readonly multipassbox_received_friend_request_from: (a: number, b: number, c: number) => number;
  readonly multipassbox_list_incoming_request: (a: number) => number;
  readonly multipassbox_sent_friend_request_to: (a: number, b: number, c: number) => number;
  readonly multipassbox_list_outgoing_request: (a: number) => number;
  readonly multipassbox_remove_friend: (a: number, b: number, c: number) => number;
  readonly multipassbox_block: (a: number, b: number, c: number) => number;
  readonly multipassbox_unblock: (a: number, b: number, c: number) => number;
  readonly multipassbox_block_list: (a: number) => number;
  readonly multipassbox_is_blocked: (a: number, b: number, c: number) => number;
  readonly multipassbox_list_friends: (a: number) => number;
  readonly multipassbox_has_friend: (a: number, b: number, c: number) => number;
  readonly __wbg_multipasseventkind_free: (a: number) => void;
  readonly multipasseventkind_kind: (a: number) => number;
  readonly multipasseventkind_did: (a: number, b: number) => void;
  readonly __wbg_identityprofile_free: (a: number) => void;
  readonly identityprofile_new: (a: number, b: number, c: number) => number;
  readonly identityprofile_identity: (a: number) => number;
  readonly identityprofile_set_identity: (a: number, b: number) => void;
  readonly identityprofile_passphrase: (a: number, b: number) => void;
  readonly __wbg_identity_free: (a: number) => void;
  readonly identity_set_username: (a: number, b: number, c: number) => void;
  readonly identity_set_status_message: (a: number, b: number, c: number) => void;
  readonly identity_set_short_id: (a: number, b: number, c: number) => void;
  readonly identity_set_did_key: (a: number, b: number, c: number) => void;
  readonly identity_set_created: (a: number, b: number) => void;
  readonly identity_set_modified: (a: number, b: number) => void;
  readonly identity_username: (a: number, b: number) => void;
  readonly identity_status_message: (a: number, b: number) => void;
  readonly identity_short_id: (a: number, b: number) => void;
  readonly identity_did_key: (a: number, b: number) => void;
  readonly identity_created: (a: number) => number;
  readonly identity_modified: (a: number) => number;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly wasm_bindgen__convert__closures__invoke1_mut__h7e720ea2de1100e2: (a: number, b: number, c: number) => void;
  readonly wasm_bindgen__convert__closures__invoke0_mut__he0d675b39a8399d4: (a: number, b: number) => void;
  readonly _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h851ad40956bf89b2: (a: number, b: number, c: number) => void;
  readonly _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h49ca63d0fff4466a: (a: number, b: number, c: number) => void;
  readonly wasm_bindgen__convert__closures__invoke1_mut__hff0f2176ee60027f: (a: number, b: number, c: number) => void;
  readonly _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__ha0ad73238c4670f6: (a: number, b: number, c: number) => void;
  readonly _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hfad670430282ef40: (a: number, b: number, c: number) => void;
  readonly wasm_bindgen__convert__closures__invoke0_mut__h7898784814d5d2ca: (a: number, b: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly wasm_bindgen__convert__closures__invoke2_mut__h050f17ebdb2912c6: (a: number, b: number, c: number, d: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
