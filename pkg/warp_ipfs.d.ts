/* tslint:disable */
/* eslint-disable */
/**
*/
export function initialize(): void;
/**
*/
export function trace(): void;
/**
* @returns {string}
*/
export function generate_name(): string;
/**
* @param {any} js
* @returns {Message}
*/
export function message_from(js: any): Message;
/**
*/
export enum TesseractEvent {
  Unlocked = 0,
  Locked = 1,
}
/**
*/
export enum ReactionState {
  Add = 0,
  Remove = 1,
}
/**
*/
export enum MessageType {
  Message = 0,
  Attachment = 1,
  Event = 2,
}
/**
*/
export enum MessageEvent {
  Typing = 0,
}
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
  AddMetadataKey = 11,
  RemoveMetadataKey = 12,
}
/**
*/
export enum MessageStatus {
  NotSent = 0,
  Sent = 1,
  Delivered = 2,
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
*/
export enum MessagesEnum {
  List = 0,
  Stream = 1,
  Page = 2,
}
/**
*/
export enum Platform {
  Desktop = 0,
  Mobile = 1,
  Web = 2,
  Unknown = 3,
}
/**
*/
export enum IdentityStatus {
  Online = 0,
  Away = 1,
  Busy = 2,
  Offline = 3,
}
/**
*/
export enum ItemType {
  FileItem = 0,
  DirectoryItem = 1,
  InvalidItem = 2,
}
/**
*/
export enum Identifier {
  DID = 0,
  DIDList = 1,
  Username = 2,
}
/**
*/
export enum PinState {
  Pin = 0,
  Unpin = 1,
}
/**
*/
export enum EmbedState {
  Enabled = 0,
  Disable = 1,
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
export class AttachmentFile {
  free(): void;
/**
* @param {string} file
* @param {AttachmentStream | undefined} [stream]
*/
  constructor(file: string, stream?: AttachmentStream);
}
/**
*/
export class AttachmentResult {
  free(): void;
/**
* @returns {string}
*/
  get_message_id(): string;
/**
* @returns {Promise<Promise<any>>}
*/
  next(): Promise<Promise<any>>;
}
/**
*/
export class AttachmentStream {
  free(): void;
/**
* @param {number | undefined} size
* @param {ReadableStream} stream
*/
  constructor(size: number | undefined, stream: ReadableStream);
}
/**
*/
export class Config {
  free(): void;
/**
* @param {string} path
*/
  with_path(path: string): void;
/**
* @param {boolean} persist
*/
  set_persistence(persist: boolean): void;
/**
* @param {boolean} enable
*/
  set_relay_enabled(enable: boolean): void;
/**
* @param {boolean} save
*/
  set_save_phrase(save: boolean): void;
/**
* @param {number | undefined} [size]
*/
  set_max_storage_size(size?: number): void;
/**
* @param {number | undefined} [size]
*/
  set_max_file_size(size?: number): void;
/**
* @param {number} size_x
* @param {number} size_y
*/
  set_thumbnail_size(size_x: number, size_y: number): void;
/**
* @param {boolean} exact
*/
  with_thumbnail_exact_format(exact: boolean): void;
/**
* @returns {Config}
*/
  static development(): Config;
/**
* @returns {Config}
*/
  static testing(): Config;
/**
* @returns {Config}
*/
  static minimal_testing(): Config;
/**
* @returns {Config}
*/
  static minimal_basic(): Config;
/**
* @param {(string)[]} addresses
* @returns {Config}
*/
  static minimal_with_relay(addresses: (string)[]): Config;
}
/**
*/
export class ConstellationBox {
  free(): void;
/**
* @returns {Date}
*/
  modified(): Date;
/**
* @returns {Directory}
*/
  root_directory(): Directory;
/**
* @returns {number}
*/
  current_size(): number;
/**
* @returns {number}
*/
  max_size(): number;
/**
* @param {string} path
*/
  select(path: string): void;
/**
* @param {string} path
*/
  set_path(path: string): void;
/**
* @returns {string}
*/
  get_path(): string;
/**
*/
  go_back(): void;
/**
* @returns {Directory}
*/
  current_directory(): Directory;
/**
* @param {string} path
* @returns {Directory}
*/
  open_directory(path: string): Directory;
/**
* @param {string} name
* @param {Uint8Array} buffer
* @returns {Promise<void>}
*/
  put_buffer(name: string, buffer: Uint8Array): Promise<void>;
/**
* @param {string} name
* @returns {Promise<any>}
*/
  get_buffer(name: string): Promise<any>;
/**
* @param {string} name
* @param {number | undefined} total_size
* @param {ReadableStream} stream
* @returns {Promise<AsyncIterator>}
*/
  put_stream(name: string, total_size: number | undefined, stream: ReadableStream): Promise<AsyncIterator>;
/**
* @param {string} name
* @returns {Promise<AsyncIterator>}
*/
  get_stream(name: string): Promise<AsyncIterator>;
/**
* @param {string} current
* @param {string} _new
* @returns {Promise<void>}
*/
  rename(current: string, _new: string): Promise<void>;
/**
* @param {string} name
* @param {boolean} recursive
* @returns {Promise<void>}
*/
  remove(name: string, recursive: boolean): Promise<void>;
/**
* @param {string} from
* @param {string} to
* @returns {Promise<void>}
*/
  move_item(from: string, to: string): Promise<void>;
/**
* @param {string} name
* @param {boolean} recursive
* @returns {Promise<void>}
*/
  create_directory(name: string, recursive: boolean): Promise<void>;
/**
* @param {string} path
* @returns {Promise<void>}
*/
  sync_ref(path: string): Promise<void>;
}
/**
*/
export class Conversation {
  free(): void;
/**
* @returns {string}
*/
  id(): string;
/**
* @returns {string | undefined}
*/
  name(): string | undefined;
/**
* @returns {string | undefined}
*/
  creator(): string | undefined;
/**
* @returns {Date}
*/
  created(): Date;
/**
* @returns {Date}
*/
  modified(): Date;
/**
* @returns {any}
*/
  settings(): any;
/**
* @returns {(string)[]}
*/
  recipients(): (string)[];
}
/**
*/
export class ConversationList {
  free(): void;
/**
* @returns {(Conversation)[]}
*/
  convs(): (Conversation)[];
}
/**
*/
export class DirectConversationSettings {
  free(): void;
}
/**
*/
export class Directory {
  free(): void;
/**
* @param {string} name
* @returns {Directory}
*/
  static new(name: string): Directory;
/**
* @param {string} item_name
* @returns {boolean}
*/
  has_item(item_name: string): boolean;
/**
* @param {File} file
*/
  add_file(file: File): void;
/**
* @param {Directory} directory
*/
  add_directory(directory: Directory): void;
/**
* @param {string} item_name
* @returns {number}
*/
  get_item_index(item_name: string): number;
/**
* @param {string} current_name
* @param {string} new_name
*/
  rename_item(current_name: string, new_name: string): void;
/**
* @param {string} item_name
* @returns {Item}
*/
  remove_item(item_name: string): Item;
/**
* @param {string} directory
* @param {string} item
* @returns {Item}
*/
  remove_item_from_path(directory: string, item: string): Item;
/**
* @param {string} child
* @param {string} dst
*/
  move_item_to(child: string, dst: string): void;
/**
* @returns {(Item)[]}
*/
  get_items(): (Item)[];
/**
* @param {(Item)[]} items
*/
  set_items(items: (Item)[]): void;
/**
* @param {Item} item
*/
  add_item(item: Item): void;
/**
* @param {string} item_name
* @returns {Item}
*/
  get_item(item_name: string): Item;
/**
* @param {string} item_name
* @returns {Item}
*/
  find_item(item_name: string): Item;
/**
* @param {(string)[]} item_names
* @returns {(Item)[]}
*/
  find_all_items(item_names: (string)[]): (Item)[];
/**
* @param {string} path
* @returns {Directory}
*/
  get_last_directory_from_path(path: string): Directory;
/**
* @param {string} path
* @returns {Item}
*/
  get_item_by_path(path: string): Item;
/**
* @returns {string}
*/
  name(): string;
/**
* @param {string} name
*/
  set_name(name: string): void;
/**
* @param {any} format
*/
  set_thumbnail_format(format: any): void;
/**
* @returns {any}
*/
  thumbnail_format(): any;
/**
* @param {Uint8Array} desc
*/
  set_thumbnail(desc: Uint8Array): void;
/**
* @returns {Uint8Array}
*/
  thumbnail(): Uint8Array;
/**
* @param {string} reference
*/
  set_thumbnail_reference(reference: string): void;
/**
* @returns {string | undefined}
*/
  thumbnail_reference(): string | undefined;
/**
* @param {boolean} fav
*/
  set_favorite(fav: boolean): void;
/**
* @returns {boolean}
*/
  favorite(): boolean;
/**
* @returns {string}
*/
  description(): string;
/**
* @param {string} desc
*/
  set_description(desc: string): void;
/**
* @returns {number}
*/
  size(): number;
/**
* @param {Date} creation
*/
  set_creation(creation: Date): void;
/**
* @param {Date | undefined} [modified]
*/
  set_modified(modified?: Date): void;
/**
* @returns {string}
*/
  path(): string;
/**
* @param {string} new_path
*/
  set_path(new_path: string): void;
/**
* @returns {string}
*/
  id(): string;
/**
* @returns {Date}
*/
  creation(): Date;
/**
* @returns {Date}
*/
  modified(): Date;
}
/**
*/
export class File {
  free(): void;
/**
* @param {string} name
* @returns {File}
*/
  static new(name: string): File;
/**
* @returns {string}
*/
  name(): string;
/**
* @param {string} id
*/
  set_id(id: string): void;
/**
* @param {string} name
*/
  set_name(name: string): void;
/**
* @returns {string}
*/
  description(): string;
/**
* @param {string} desc
*/
  set_description(desc: string): void;
/**
* @param {any} format
*/
  set_thumbnail_format(format: any): void;
/**
* @returns {any}
*/
  thumbnail_format(): any;
/**
* @param {Uint8Array} data
*/
  set_thumbnail(data: Uint8Array): void;
/**
* @returns {Uint8Array}
*/
  thumbnail(): Uint8Array;
/**
* @param {boolean} fav
*/
  set_favorite(fav: boolean): void;
/**
* @returns {boolean}
*/
  favorite(): boolean;
/**
* @param {string} reference
*/
  set_reference(reference: string): void;
/**
* @param {string} reference
*/
  set_thumbnail_reference(reference: string): void;
/**
* @returns {string | undefined}
*/
  reference(): string | undefined;
/**
* @returns {string | undefined}
*/
  thumbnail_reference(): string | undefined;
/**
* @returns {number}
*/
  size(): number;
/**
* @param {number} size
*/
  set_size(size: number): void;
/**
* @param {Date} creation
*/
  set_creation(creation: Date): void;
/**
* @param {Date | undefined} [modified]
*/
  set_modified(modified?: Date): void;
/**
* @returns {Hash}
*/
  hash(): Hash;
/**
* @param {Hash} hash
*/
  set_hash(hash: Hash): void;
/**
* @param {any} file_type
*/
  set_file_type(file_type: any): void;
/**
* @returns {any}
*/
  file_type(): any;
/**
* @returns {string}
*/
  path(): string;
/**
* @param {string} new_path
*/
  set_path(new_path: string): void;
/**
* @returns {string}
*/
  id(): string;
/**
* @returns {Date}
*/
  creation(): Date;
/**
* @returns {Date}
*/
  modified(): Date;
}
/**
*/
export class GroupSettings {
  free(): void;
/**
*/
  constructor();
/**
* @returns {boolean}
*/
  members_can_add_participants(): boolean;
/**
* @returns {boolean}
*/
  members_can_change_name(): boolean;
/**
* @param {boolean} val
*/
  set_members_can_add_participants(val: boolean): void;
/**
* @param {boolean} val
*/
  set_members_can_change_name(val: boolean): void;
}
/**
*/
export class Hash {
  free(): void;
/**
* @returns {string | undefined}
*/
  sha256(): string | undefined;
}
/**
*/
export class Identity {
  free(): void;
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
/**
* @returns {any}
*/
  metadata(): any;
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
* @param {Map<any, any>} map
*/
  set_metadata(map: Map<any, any>): void;
}
/**
*/
export class IdentityImage {
  free(): void;
/**
* @returns {Uint8Array}
*/
  data(): Uint8Array;
/**
* @returns {any}
*/
  image_type(): any;
}
/**
*/
export class IdentityProfile {
  free(): void;
/**
* @returns {Identity}
*/
  identity(): Identity;
/**
* @returns {string | undefined}
*/
  passphrase(): string | undefined;
}
/**
*/
export class IntoUnderlyingByteSource {
  free(): void;
/**
* @param {ReadableByteStreamController} controller
*/
  start(controller: ReadableByteStreamController): void;
/**
* @param {ReadableByteStreamController} controller
* @returns {Promise<any>}
*/
  pull(controller: ReadableByteStreamController): Promise<any>;
/**
*/
  cancel(): void;
/**
*/
  readonly autoAllocateChunkSize: number;
/**
*/
  readonly type: string;
}
/**
*/
export class IntoUnderlyingSink {
  free(): void;
/**
* @param {any} chunk
* @returns {Promise<any>}
*/
  write(chunk: any): Promise<any>;
/**
* @returns {Promise<any>}
*/
  close(): Promise<any>;
/**
* @param {any} reason
* @returns {Promise<any>}
*/
  abort(reason: any): Promise<any>;
}
/**
*/
export class IntoUnderlyingSource {
  free(): void;
/**
* @param {ReadableStreamDefaultController} controller
* @returns {Promise<any>}
*/
  pull(controller: ReadableStreamDefaultController): Promise<any>;
/**
*/
  cancel(): void;
}
/**
*/
export class Item {
  free(): void;
/**
* @param {File} file
* @returns {Item}
*/
  static new_file(file: File): Item;
/**
* @param {Directory} directory
* @returns {Item}
*/
  static new_directory(directory: Directory): Item;
/**
* @returns {File | undefined}
*/
  file(): File | undefined;
/**
* @returns {Directory | undefined}
*/
  directory(): Directory | undefined;
/**
* @returns {string}
*/
  id(): string;
/**
* @returns {Date}
*/
  creation(): Date;
/**
* @returns {Date}
*/
  modified(): Date;
/**
* @returns {string}
*/
  name(): string;
/**
* @returns {string}
*/
  description(): string;
/**
* @returns {number}
*/
  size(): number;
/**
* @returns {any}
*/
  thumbnail_format(): any;
/**
* @returns {Uint8Array}
*/
  thumbnail(): Uint8Array;
/**
* @returns {boolean}
*/
  favorite(): boolean;
/**
* @param {boolean} fav
*/
  set_favorite(fav: boolean): void;
/**
* @param {string} name
*/
  rename(name: string): void;
/**
* @returns {boolean}
*/
  is_directory(): boolean;
/**
* @returns {boolean}
*/
  is_file(): boolean;
/**
* @returns {ItemType}
*/
  item_type(): ItemType;
/**
* @param {string} desc
*/
  set_description(desc: string): void;
/**
* @param {Uint8Array} data
*/
  set_thumbnail(data: Uint8Array): void;
/**
* @param {any} format
*/
  set_thumbnail_format(format: any): void;
/**
* @param {number} size
*/
  set_size(size: number): void;
/**
* @returns {string}
*/
  path(): string;
/**
* @param {string} new_path
*/
  set_path(new_path: string): void;
/**
* @returns {Directory}
*/
  get_directory(): Directory;
/**
* @returns {File}
*/
  get_file(): File;
}
/**
*/
export class Message {
  free(): void;
/**
* @returns {string}
*/
  id(): string;
/**
* @returns {MessageType}
*/
  message_type(): MessageType;
/**
* @returns {string}
*/
  conversation_id(): string;
/**
* @returns {string}
*/
  sender(): string;
/**
* @returns {Date}
*/
  date(): Date;
/**
* @returns {Date | undefined}
*/
  modified(): Date | undefined;
/**
* @returns {boolean}
*/
  pinned(): boolean;
/**
* @returns {any}
*/
  reactions(): any;
/**
* @returns {(string)[]}
*/
  mentions(): (string)[];
/**
* @returns {(string)[]}
*/
  lines(): (string)[];
/**
* @returns {any[]}
*/
  attachments(): any[];
/**
* @returns {any}
*/
  metadata(): any;
/**
* @returns {string | undefined}
*/
  replied(): string | undefined;
}
/**
*/
export class MessageOptions {
  free(): void;
/**
*/
  constructor();
/**
* @param {any} range
*/
  set_date_range(range: any): void;
/**
* @param {any} range
*/
  set_range(range: any): void;
/**
* @param {number} limit
*/
  set_limit(limit: number): void;
/**
* @param {bigint} skip
*/
  set_skip(skip: bigint): void;
/**
* @param {string} keyword
*/
  set_keyword(keyword: string): void;
/**
*/
  set_first_message(): void;
/**
*/
  set_last_message(): void;
/**
*/
  set_pinned(): void;
/**
*/
  set_reverse(): void;
/**
* @param {any} ty
*/
  set_messages_type(ty: any): void;
}
/**
*/
export class MessageReference {
  free(): void;
/**
* @returns {string}
*/
  id(): string;
/**
* @returns {string}
*/
  conversation_id(): string;
/**
* @returns {string}
*/
  sender(): string;
/**
* @returns {Date}
*/
  date(): Date;
/**
* @returns {Date | undefined}
*/
  modified(): Date | undefined;
/**
* @returns {boolean}
*/
  pinned(): boolean;
/**
* @returns {string | undefined}
*/
  replied(): string | undefined;
/**
* @returns {boolean}
*/
  deleted(): boolean;
}
/**
*/
export class Messages {
  free(): void;
/**
* @returns {MessagesEnum}
*/
  variant(): MessagesEnum;
/**
* @returns {any}
*/
  value(): any;
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
  identity(): Promise<Identity>;
/**
* @returns {Tesseract}
*/
  tesseract(): Tesseract;
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
/**
* Profile picture belonging to the `Identity`
* @param {string} did
* @returns {Promise<IdentityImage>}
*/
  identity_picture(did: string): Promise<IdentityImage>;
/**
* Profile banner belonging to the `Identity`
* @param {string} did
* @returns {Promise<IdentityImage>}
*/
  identity_banner(did: string): Promise<IdentityImage>;
/**
* Identity status to determine if they are online or offline
* @param {string} did
* @returns {Promise<IdentityStatus>}
*/
  identity_status(did: string): Promise<IdentityStatus>;
/**
* Identity status to determine if they are online or offline
* @param {IdentityStatus} status
* @returns {Promise<void>}
*/
  set_identity_status(status: IdentityStatus): Promise<void>;
/**
* Find the relationship with an existing identity.
* @param {string} did
* @returns {Promise<Relationship>}
*/
  identity_relationship(did: string): Promise<Relationship>;
/**
* Returns the identity platform while online.
* @param {string} did
* @returns {Promise<Platform>}
*/
  identity_platform(did: string): Promise<Platform>;
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
/**
* @param {string} did
* @returns {Promise<Conversation>}
*/
  create_conversation(did: string): Promise<Conversation>;
/**
* @param {string | undefined} name
* @param {(string)[]} recipients
* @param {GroupSettings} settings
* @returns {Promise<Conversation>}
*/
  create_group_conversation(name: string | undefined, recipients: (string)[], settings: GroupSettings): Promise<Conversation>;
/**
* Get an active conversation
* @param {string} conversation_id
* @returns {Promise<Conversation>}
*/
  get_conversation(conversation_id: string): Promise<Conversation>;
/**
* @param {string} conversation_id
* @param {boolean} favorite
* @returns {Promise<void>}
*/
  set_favorite_conversation(conversation_id: string, favorite: boolean): Promise<void>;
/**
* List all active conversations
* @returns {Promise<ConversationList>}
*/
  list_conversations(): Promise<ConversationList>;
/**
* Retrieve all messages from a conversation
* @param {string} conversation_id
* @param {string} message_id
* @returns {Promise<Message>}
*/
  get_message(conversation_id: string, message_id: string): Promise<Message>;
/**
* Get a number of messages in a conversation
* @param {string} conversation_id
* @returns {Promise<number>}
*/
  get_message_count(conversation_id: string): Promise<number>;
/**
* Get a status of a message in a conversation
* @param {string} conversation_id
* @param {string} message_id
* @returns {Promise<MessageStatus>}
*/
  message_status(conversation_id: string, message_id: string): Promise<MessageStatus>;
/**
* Retrieve all message references from a conversation
* @param {string} conversation_id
* @param {MessageOptions} options
* @returns {Promise<AsyncIterator>}
*/
  get_message_references(conversation_id: string, options: MessageOptions): Promise<AsyncIterator>;
/**
* Retrieve a message reference from a conversation
* @param {string} conversation_id
* @param {string} message_id
* @returns {Promise<MessageReference>}
*/
  get_message_reference(conversation_id: string, message_id: string): Promise<MessageReference>;
/**
* Retrieve all messages from a conversation
* @param {string} conversation_id
* @param {MessageOptions} options
* @returns {Promise<Messages>}
*/
  get_messages(conversation_id: string, options: MessageOptions): Promise<Messages>;
/**
* Sends a message to a conversation.
* @param {string} conversation_id
* @param {(string)[]} message
* @returns {Promise<string>}
*/
  send(conversation_id: string, message: (string)[]): Promise<string>;
/**
* Edit an existing message in a conversation.
* @param {string} conversation_id
* @param {string} message_id
* @param {(string)[]} message
* @returns {Promise<void>}
*/
  edit(conversation_id: string, message_id: string, message: (string)[]): Promise<void>;
/**
* Delete message from a conversation
* @param {string} conversation_id
* @param {string | undefined} [message_id]
* @returns {Promise<void>}
*/
  delete(conversation_id: string, message_id?: string): Promise<void>;
/**
* React to a message
* @param {string} conversation_id
* @param {string} message_id
* @param {ReactionState} state
* @param {string} emoji
* @returns {Promise<void>}
*/
  react(conversation_id: string, message_id: string, state: ReactionState, emoji: string): Promise<void>;
/**
* Pin a message within a conversation
* @param {string} conversation_id
* @param {string} message_id
* @param {PinState} state
* @returns {Promise<void>}
*/
  pin(conversation_id: string, message_id: string, state: PinState): Promise<void>;
/**
* Reply to a message within a conversation
* @param {string} conversation_id
* @param {string} message_id
* @param {(string)[]} message
* @returns {Promise<string>}
*/
  reply(conversation_id: string, message_id: string, message: (string)[]): Promise<string>;
/**
* @param {string} conversation_id
* @param {string} message_id
* @param {EmbedState} state
* @returns {Promise<void>}
*/
  embeds(conversation_id: string, message_id: string, state: EmbedState): Promise<void>;
/**
* Update conversation settings
* @param {string} conversation_id
* @param {any} settings
* @returns {Promise<void>}
*/
  update_conversation_settings(conversation_id: string, settings: any): Promise<void>;
/**
* @param {string} conversation_id
* @param {string} name
* @returns {Promise<void>}
*/
  update_conversation_name(conversation_id: string, name: string): Promise<void>;
/**
* Add a recipient to the conversation
* @param {string} conversation_id
* @param {string} recipient
* @returns {Promise<void>}
*/
  add_recipient(conversation_id: string, recipient: string): Promise<void>;
/**
* Remove a recipient from the conversation
* @param {string} conversation_id
* @param {string} recipient
* @returns {Promise<void>}
*/
  remove_recipient(conversation_id: string, recipient: string): Promise<void>;
/**
* Send files to a conversation.
* If no files is provided in the array, it will throw an error
* @param {string} conversation_id
* @param {string | undefined} message_id
* @param {(AttachmentFile)[]} files
* @param {(string)[]} message
* @returns {Promise<AttachmentResult>}
*/
  attach(conversation_id: string, message_id: string | undefined, files: (AttachmentFile)[], message: (string)[]): Promise<AttachmentResult>;
/**
* Stream a file that been attached to a message
* Note: Must use the filename associated when downloading
* @param {string} conversation_id
* @param {string} message_id
* @param {string} file
* @returns {Promise<AsyncIterator>}
*/
  download_stream(conversation_id: string, message_id: string, file: string): Promise<AsyncIterator>;
/**
* Subscribe to an stream of events from the conversation
* @param {string} conversation_id
* @returns {Promise<AsyncIterator>}
*/
  get_conversation_stream(conversation_id: string): Promise<AsyncIterator>;
/**
* Subscribe to an stream of events
* @returns {Promise<AsyncIterator>}
*/
  raygun_subscribe(): Promise<AsyncIterator>;
/**
* Send an event to a conversation
* @param {string} conversation_id
* @param {MessageEvent} event
* @returns {Promise<void>}
*/
  send_event(conversation_id: string, event: MessageEvent): Promise<void>;
/**
* Cancel event that was sent, if any.
* @param {string} conversation_id
* @param {MessageEvent} event
* @returns {Promise<void>}
*/
  cancel_event(conversation_id: string, event: MessageEvent): Promise<void>;
}
/**
*/
export class Relationship {
  free(): void;
/**
* @returns {boolean}
*/
  friends(): boolean;
/**
* @returns {boolean}
*/
  received_friend_request(): boolean;
/**
* @returns {boolean}
*/
  sent_friend_request(): boolean;
/**
* @returns {boolean}
*/
  blocked(): boolean;
/**
* @returns {boolean}
*/
  blocked_by(): boolean;
}
/**
*/
export class Tesseract {
  free(): void;
/**
*/
  constructor();
/**
*/
  set_autosave(): void;
/**
* @returns {boolean}
*/
  autosave_enabled(): boolean;
/**
*/
  disable_key_check(): void;
/**
*/
  enable_key_check(): void;
/**
* @returns {boolean}
*/
  is_key_check_enabled(): boolean;
/**
* @param {string} key
* @returns {boolean}
*/
  exist(key: string): boolean;
/**
*/
  clear(): void;
/**
* @returns {boolean}
*/
  is_unlock(): boolean;
/**
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
  delete(key: string): void;
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
* @param {Tesseract | undefined} [tesseract]
*/
  constructor(config: Config, tesseract?: Tesseract);
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_asynciterator_free: (a: number, b: number) => void;
  readonly asynciterator_next: (a: number) => number;
  readonly __wbg_promiseresult_free: (a: number, b: number) => void;
  readonly __wbg_get_promiseresult_done: (a: number) => number;
  readonly __wbg_set_promiseresult_done: (a: number, b: number) => void;
  readonly promiseresult_new: (a: number) => number;
  readonly promiseresult_value: (a: number) => number;
  readonly __wbg_tesseract_free: (a: number, b: number) => void;
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
  readonly tesseract_delete: (a: number, b: number, c: number, d: number) => void;
  readonly tesseract_unlock: (a: number, b: number, c: number, d: number) => void;
  readonly tesseract_save: (a: number, b: number) => void;
  readonly tesseract_subscribe: (a: number) => number;
  readonly tesseract_load_from_storage: (a: number, b: number) => void;
  readonly __wbg_warpinstance_free: (a: number, b: number) => void;
  readonly warpinstance_multipass: (a: number) => number;
  readonly warpinstance_raygun: (a: number) => number;
  readonly warpinstance_constellation: (a: number) => number;
  readonly initialize: () => void;
  readonly trace: () => void;
  readonly __wbg_constellationbox_free: (a: number, b: number) => void;
  readonly constellationbox_modified: (a: number) => number;
  readonly constellationbox_root_directory: (a: number) => number;
  readonly constellationbox_current_size: (a: number) => number;
  readonly constellationbox_max_size: (a: number) => number;
  readonly constellationbox_select: (a: number, b: number, c: number, d: number) => void;
  readonly constellationbox_set_path: (a: number, b: number, c: number) => void;
  readonly constellationbox_get_path: (a: number, b: number) => void;
  readonly constellationbox_go_back: (a: number, b: number) => void;
  readonly constellationbox_current_directory: (a: number, b: number) => void;
  readonly constellationbox_open_directory: (a: number, b: number, c: number, d: number) => void;
  readonly constellationbox_put_buffer: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly constellationbox_get_buffer: (a: number, b: number, c: number) => number;
  readonly constellationbox_put_stream: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
  readonly constellationbox_get_stream: (a: number, b: number, c: number) => number;
  readonly constellationbox_rename: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly constellationbox_remove: (a: number, b: number, c: number, d: number) => number;
  readonly constellationbox_move_item: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly constellationbox_create_directory: (a: number, b: number, c: number, d: number) => number;
  readonly constellationbox_sync_ref: (a: number, b: number, c: number) => number;
  readonly __wbg_directory_free: (a: number, b: number) => void;
  readonly directory_new: (a: number, b: number) => number;
  readonly directory_has_item: (a: number, b: number, c: number) => number;
  readonly directory_add_file: (a: number, b: number, c: number) => void;
  readonly directory_add_directory: (a: number, b: number, c: number) => void;
  readonly directory_get_item_index: (a: number, b: number, c: number, d: number) => void;
  readonly directory_rename_item: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly directory_remove_item: (a: number, b: number, c: number, d: number) => void;
  readonly directory_remove_item_from_path: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly directory_move_item_to: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly directory_get_items: (a: number, b: number) => void;
  readonly directory_set_items: (a: number, b: number, c: number) => void;
  readonly directory_add_item: (a: number, b: number, c: number) => void;
  readonly directory_get_item: (a: number, b: number, c: number, d: number) => void;
  readonly directory_find_item: (a: number, b: number, c: number, d: number) => void;
  readonly directory_find_all_items: (a: number, b: number, c: number, d: number) => void;
  readonly directory_get_last_directory_from_path: (a: number, b: number, c: number, d: number) => void;
  readonly directory_get_item_by_path: (a: number, b: number, c: number, d: number) => void;
  readonly directory_name: (a: number, b: number) => void;
  readonly directory_set_name: (a: number, b: number, c: number) => void;
  readonly directory_set_thumbnail_format: (a: number, b: number) => void;
  readonly directory_thumbnail_format: (a: number) => number;
  readonly directory_set_thumbnail: (a: number, b: number, c: number) => void;
  readonly directory_thumbnail: (a: number, b: number) => void;
  readonly directory_set_thumbnail_reference: (a: number, b: number, c: number) => void;
  readonly directory_thumbnail_reference: (a: number, b: number) => void;
  readonly directory_set_favorite: (a: number, b: number) => void;
  readonly directory_favorite: (a: number) => number;
  readonly directory_description: (a: number, b: number) => void;
  readonly directory_set_description: (a: number, b: number, c: number) => void;
  readonly directory_size: (a: number) => number;
  readonly directory_set_creation: (a: number, b: number) => void;
  readonly directory_set_modified: (a: number, b: number) => void;
  readonly directory_path: (a: number, b: number) => void;
  readonly directory_set_path: (a: number, b: number, c: number) => void;
  readonly directory_id: (a: number, b: number) => void;
  readonly directory_creation: (a: number) => number;
  readonly directory_modified: (a: number) => number;
  readonly __wbg_file_free: (a: number, b: number) => void;
  readonly file_new: (a: number, b: number) => number;
  readonly file_name: (a: number, b: number) => void;
  readonly file_set_id: (a: number, b: number, c: number) => void;
  readonly file_set_name: (a: number, b: number, c: number) => void;
  readonly file_description: (a: number, b: number) => void;
  readonly file_set_description: (a: number, b: number, c: number) => void;
  readonly file_set_thumbnail_format: (a: number, b: number) => void;
  readonly file_thumbnail_format: (a: number) => number;
  readonly file_set_thumbnail: (a: number, b: number, c: number) => void;
  readonly file_thumbnail: (a: number, b: number) => void;
  readonly file_set_favorite: (a: number, b: number) => void;
  readonly file_favorite: (a: number) => number;
  readonly file_set_reference: (a: number, b: number, c: number) => void;
  readonly file_set_thumbnail_reference: (a: number, b: number, c: number) => void;
  readonly file_reference: (a: number, b: number) => void;
  readonly file_thumbnail_reference: (a: number, b: number) => void;
  readonly file_size: (a: number) => number;
  readonly file_set_size: (a: number, b: number) => void;
  readonly file_set_creation: (a: number, b: number) => void;
  readonly file_set_modified: (a: number, b: number) => void;
  readonly file_hash: (a: number) => number;
  readonly file_set_hash: (a: number, b: number) => void;
  readonly file_set_file_type: (a: number, b: number) => void;
  readonly file_file_type: (a: number) => number;
  readonly file_path: (a: number, b: number) => void;
  readonly file_set_path: (a: number, b: number, c: number) => void;
  readonly file_id: (a: number, b: number) => void;
  readonly file_creation: (a: number) => number;
  readonly file_modified: (a: number) => number;
  readonly __wbg_item_free: (a: number, b: number) => void;
  readonly item_new_file: (a: number) => number;
  readonly item_new_directory: (a: number) => number;
  readonly item_file: (a: number) => number;
  readonly item_directory: (a: number) => number;
  readonly item_id: (a: number, b: number) => void;
  readonly item_creation: (a: number) => number;
  readonly item_modified: (a: number) => number;
  readonly item_name: (a: number, b: number) => void;
  readonly item_description: (a: number, b: number) => void;
  readonly item_size: (a: number) => number;
  readonly item_thumbnail_format: (a: number) => number;
  readonly item_thumbnail: (a: number, b: number) => void;
  readonly item_favorite: (a: number) => number;
  readonly item_set_favorite: (a: number, b: number) => void;
  readonly item_rename: (a: number, b: number, c: number, d: number) => void;
  readonly item_is_directory: (a: number) => number;
  readonly item_is_file: (a: number) => number;
  readonly item_set_description: (a: number, b: number, c: number) => void;
  readonly item_set_thumbnail: (a: number, b: number, c: number) => void;
  readonly item_set_thumbnail_format: (a: number, b: number) => void;
  readonly item_set_size: (a: number, b: number, c: number) => void;
  readonly item_path: (a: number, b: number) => void;
  readonly item_set_path: (a: number, b: number, c: number) => void;
  readonly item_get_directory: (a: number, b: number) => void;
  readonly item_get_file: (a: number, b: number) => void;
  readonly __wbg_hash_free: (a: number, b: number) => void;
  readonly hash_sha256: (a: number, b: number) => void;
  readonly item_item_type: (a: number) => number;
  readonly __wbg_warpipfs_free: (a: number, b: number) => void;
  readonly warpipfs_new: (a: number, b: number) => number;
  readonly __wbg_config_free: (a: number, b: number) => void;
  readonly config_with_path: (a: number, b: number, c: number) => void;
  readonly config_set_persistence: (a: number, b: number) => void;
  readonly config_set_relay_enabled: (a: number, b: number) => void;
  readonly config_set_save_phrase: (a: number, b: number) => void;
  readonly config_set_max_storage_size: (a: number, b: number, c: number) => void;
  readonly config_set_max_file_size: (a: number, b: number, c: number) => void;
  readonly config_set_thumbnail_size: (a: number, b: number, c: number) => void;
  readonly config_with_thumbnail_exact_format: (a: number, b: number) => void;
  readonly config_development: () => number;
  readonly config_testing: () => number;
  readonly config_minimal_testing: () => number;
  readonly config_minimal_basic: () => number;
  readonly config_minimal_with_relay: (a: number, b: number) => number;
  readonly __wbg_multipassbox_free: (a: number, b: number) => void;
  readonly multipassbox_create_identity: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly multipassbox_get_identity: (a: number, b: number, c: number) => number;
  readonly multipassbox_identity: (a: number) => number;
  readonly multipassbox_tesseract: (a: number) => number;
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
  readonly multipassbox_identity_picture: (a: number, b: number, c: number) => number;
  readonly multipassbox_identity_banner: (a: number, b: number, c: number) => number;
  readonly multipassbox_identity_status: (a: number, b: number, c: number) => number;
  readonly multipassbox_set_identity_status: (a: number, b: number) => number;
  readonly multipassbox_identity_relationship: (a: number, b: number, c: number) => number;
  readonly multipassbox_identity_platform: (a: number, b: number, c: number) => number;
  readonly __wbg_multipasseventkind_free: (a: number, b: number) => void;
  readonly multipasseventkind_kind: (a: number) => number;
  readonly multipasseventkind_did: (a: number, b: number) => void;
  readonly __wbg_identityimage_free: (a: number, b: number) => void;
  readonly identityimage_data: (a: number, b: number) => void;
  readonly identityimage_image_type: (a: number) => number;
  readonly __wbg_identity_free: (a: number, b: number) => void;
  readonly identity_username: (a: number, b: number) => void;
  readonly identity_status_message: (a: number, b: number) => void;
  readonly identity_short_id: (a: number, b: number) => void;
  readonly identity_did_key: (a: number, b: number) => void;
  readonly identity_created: (a: number) => number;
  readonly identity_modified: (a: number) => number;
  readonly identity_metadata: (a: number) => number;
  readonly identity_set_username: (a: number, b: number, c: number) => void;
  readonly identity_set_status_message: (a: number, b: number, c: number) => void;
  readonly identity_set_short_id: (a: number, b: number, c: number) => void;
  readonly identity_set_did_key: (a: number, b: number, c: number) => void;
  readonly identity_set_created: (a: number, b: number) => void;
  readonly identity_set_modified: (a: number, b: number) => void;
  readonly identity_set_metadata: (a: number, b: number) => void;
  readonly __wbg_relationship_free: (a: number, b: number) => void;
  readonly relationship_friends: (a: number) => number;
  readonly relationship_received_friend_request: (a: number) => number;
  readonly relationship_sent_friend_request: (a: number) => number;
  readonly relationship_blocked: (a: number) => number;
  readonly relationship_blocked_by: (a: number) => number;
  readonly __wbg_identityprofile_free: (a: number, b: number) => void;
  readonly identityprofile_identity: (a: number) => number;
  readonly identityprofile_passphrase: (a: number, b: number) => void;
  readonly generate_name: (a: number) => void;
  readonly __wbg_raygunbox_free: (a: number, b: number) => void;
  readonly raygunbox_create_conversation: (a: number, b: number, c: number) => number;
  readonly raygunbox_create_group_conversation: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
  readonly raygunbox_get_conversation: (a: number, b: number, c: number) => number;
  readonly raygunbox_set_favorite_conversation: (a: number, b: number, c: number, d: number) => number;
  readonly raygunbox_list_conversations: (a: number) => number;
  readonly raygunbox_get_message: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly raygunbox_get_message_count: (a: number, b: number, c: number) => number;
  readonly raygunbox_message_status: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly raygunbox_get_message_references: (a: number, b: number, c: number, d: number) => number;
  readonly raygunbox_get_message_reference: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly raygunbox_get_messages: (a: number, b: number, c: number, d: number) => number;
  readonly raygunbox_send: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly raygunbox_edit: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => number;
  readonly raygunbox_delete: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly raygunbox_react: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => number;
  readonly raygunbox_pin: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
  readonly raygunbox_reply: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => number;
  readonly raygunbox_embeds: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
  readonly raygunbox_update_conversation_settings: (a: number, b: number, c: number, d: number) => number;
  readonly raygunbox_update_conversation_name: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly raygunbox_add_recipient: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly raygunbox_remove_recipient: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly raygunbox_attach: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => number;
  readonly raygunbox_download_stream: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => number;
  readonly raygunbox_get_conversation_stream: (a: number, b: number, c: number) => number;
  readonly raygunbox_raygun_subscribe: (a: number) => number;
  readonly raygunbox_send_event: (a: number, b: number, c: number, d: number) => number;
  readonly raygunbox_cancel_event: (a: number, b: number, c: number, d: number) => number;
  readonly __wbg_conversationlist_free: (a: number, b: number) => void;
  readonly conversationlist_convs: (a: number, b: number) => void;
  readonly __wbg_conversation_free: (a: number, b: number) => void;
  readonly conversation_id: (a: number, b: number) => void;
  readonly conversation_name: (a: number, b: number) => void;
  readonly conversation_creator: (a: number, b: number) => void;
  readonly conversation_created: (a: number) => number;
  readonly conversation_modified: (a: number) => number;
  readonly conversation_settings: (a: number) => number;
  readonly conversation_recipients: (a: number, b: number) => void;
  readonly __wbg_messages_free: (a: number, b: number) => void;
  readonly messages_variant: (a: number) => number;
  readonly messages_value: (a: number) => number;
  readonly __wbg_messageoptions_free: (a: number, b: number) => void;
  readonly messageoptions_new: () => number;
  readonly messageoptions_set_date_range: (a: number, b: number) => void;
  readonly messageoptions_set_range: (a: number, b: number) => void;
  readonly messageoptions_set_limit: (a: number, b: number) => void;
  readonly messageoptions_set_skip: (a: number, b: number) => void;
  readonly messageoptions_set_keyword: (a: number, b: number, c: number) => void;
  readonly messageoptions_set_first_message: (a: number) => void;
  readonly messageoptions_set_last_message: (a: number) => void;
  readonly messageoptions_set_pinned: (a: number) => void;
  readonly messageoptions_set_reverse: (a: number) => void;
  readonly messageoptions_set_messages_type: (a: number, b: number) => void;
  readonly __wbg_messagereference_free: (a: number, b: number) => void;
  readonly messagereference_id: (a: number, b: number) => void;
  readonly messagereference_conversation_id: (a: number, b: number) => void;
  readonly messagereference_sender: (a: number, b: number) => void;
  readonly messagereference_date: (a: number) => number;
  readonly messagereference_modified: (a: number) => number;
  readonly messagereference_pinned: (a: number) => number;
  readonly messagereference_replied: (a: number, b: number) => void;
  readonly messagereference_deleted: (a: number) => number;
  readonly message_from: (a: number) => number;
  readonly __wbg_message_free: (a: number, b: number) => void;
  readonly message_id: (a: number, b: number) => void;
  readonly message_message_type: (a: number) => number;
  readonly message_conversation_id: (a: number, b: number) => void;
  readonly message_sender: (a: number, b: number) => void;
  readonly message_date: (a: number) => number;
  readonly message_modified: (a: number) => number;
  readonly message_pinned: (a: number) => number;
  readonly message_reactions: (a: number) => number;
  readonly message_mentions: (a: number, b: number) => void;
  readonly message_lines: (a: number, b: number) => void;
  readonly message_attachments: (a: number, b: number) => void;
  readonly message_metadata: (a: number) => number;
  readonly message_replied: (a: number, b: number) => void;
  readonly __wbg_attachmentfile_free: (a: number, b: number) => void;
  readonly attachmentfile_new: (a: number, b: number, c: number) => number;
  readonly __wbg_attachmentstream_free: (a: number, b: number) => void;
  readonly attachmentstream_new: (a: number, b: number, c: number) => number;
  readonly __wbg_attachmentresult_free: (a: number, b: number) => void;
  readonly attachmentresult_get_message_id: (a: number, b: number) => void;
  readonly attachmentresult_next: (a: number) => number;
  readonly __wbg_groupsettings_free: (a: number, b: number) => void;
  readonly groupsettings_new: () => number;
  readonly groupsettings_members_can_add_participants: (a: number) => number;
  readonly groupsettings_members_can_change_name: (a: number) => number;
  readonly groupsettings_set_members_can_add_participants: (a: number, b: number) => void;
  readonly groupsettings_set_members_can_change_name: (a: number, b: number) => void;
  readonly __wbg_directconversationsettings_free: (a: number, b: number) => void;
  readonly __wbg_intounderlyingbytesource_free: (a: number, b: number) => void;
  readonly intounderlyingbytesource_type: (a: number, b: number) => void;
  readonly intounderlyingbytesource_autoAllocateChunkSize: (a: number) => number;
  readonly intounderlyingbytesource_start: (a: number, b: number) => void;
  readonly intounderlyingbytesource_pull: (a: number, b: number) => number;
  readonly intounderlyingbytesource_cancel: (a: number) => void;
  readonly __wbg_intounderlyingsink_free: (a: number, b: number) => void;
  readonly intounderlyingsink_write: (a: number, b: number) => number;
  readonly intounderlyingsink_close: (a: number) => number;
  readonly intounderlyingsink_abort: (a: number, b: number) => number;
  readonly __wbg_intounderlyingsource_free: (a: number, b: number) => void;
  readonly intounderlyingsource_pull: (a: number, b: number) => number;
  readonly intounderlyingsource_cancel: (a: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h0e1a98f262925daa: (a: number, b: number, c: number) => void;
  readonly _dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h6c16c0f1caba197c: (a: number, b: number) => void;
  readonly _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hdb0c539a19d06a5e: (a: number, b: number, c: number) => void;
  readonly _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__he40da99b13925068: (a: number, b: number, c: number) => void;
  readonly _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h61049a5d21350abd: (a: number, b: number, c: number) => void;
  readonly _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hc8166617420c463b: (a: number, b: number, c: number) => void;
  readonly _dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h061ec503a8000c7f: (a: number, b: number) => void;
  readonly _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h6305ca737f413108: (a: number, b: number, c: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly wasm_bindgen__convert__closures__invoke2_mut__h24df5d87e1a95015: (a: number, b: number, c: number, d: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
