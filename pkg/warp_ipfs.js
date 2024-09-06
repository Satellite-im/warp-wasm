let wasm;

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); };

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : { encode: () => { throw Error('TextEncoder not available') } } );

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachedDataViewMemory0 = null;

function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(state => {
    wasm.__wbindgen_export_2.get(state.dtor)(state.a, state.b)
});

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);
                CLOSURE_DTORS.unregister(state);
            } else {
                state.a = a;
            }
        }
    };
    real.original = state;
    CLOSURE_DTORS.register(real, state, state);
    return real;
}
function __wbg_adapter_52(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h0e1a98f262925daa(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_55(arg0, arg1) {
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h6c16c0f1caba197c(arg0, arg1);
}

function __wbg_adapter_58(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hdb0c539a19d06a5e(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_61(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__he40da99b13925068(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_64(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h61049a5d21350abd(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_71(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hc8166617420c463b(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_74(arg0, arg1) {
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h061ec503a8000c7f(arg0, arg1);
}

function __wbg_adapter_77(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h6305ca737f413108(arg0, arg1, addHeapObject(arg2));
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}
/**
*/
export function initialize() {
    wasm.initialize();
}

/**
*/
export function trace() {
    wasm.trace();
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getDataViewMemory0();
    const result = [];
    for (let i = ptr; i < ptr + 4 * len; i += 4) {
        result.push(takeObject(mem.getUint32(i, true)));
    }
    return result;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    const mem = getDataViewMemory0();
    for (let i = 0; i < array.length; i++) {
        mem.setUint32(ptr + 4 * i, addHeapObject(array[i]), true);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}
/**
* @returns {string}
*/
export function generate_name() {
    let deferred1_0;
    let deferred1_1;
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.generate_name(retptr);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        deferred1_0 = r0;
        deferred1_1 = r1;
        return getStringFromWasm0(r0, r1);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
}

/**
* @param {any} js
* @returns {Message}
*/
export function message_from(js) {
    const ret = wasm.message_from(addHeapObject(js));
    return Message.__wrap(ret);
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}
function __wbg_adapter_659(arg0, arg1, arg2, arg3) {
    wasm.wasm_bindgen__convert__closures__invoke2_mut__h24df5d87e1a95015(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}

/**
*/
export const IdentityStatus = Object.freeze({ Online:0,"0":"Online",Away:1,"1":"Away",Busy:2,"2":"Busy",Offline:3,"3":"Offline", });
/**
*/
export const ItemType = Object.freeze({ FileItem:0,"0":"FileItem",DirectoryItem:1,"1":"DirectoryItem",InvalidItem:2,"2":"InvalidItem", });
/**
*/
export const ReactionState = Object.freeze({ Add:0,"0":"Add",Remove:1,"1":"Remove", });
/**
*/
export const MessageType = Object.freeze({ Message:0,"0":"Message",Attachment:1,"1":"Attachment",Event:2,"2":"Event", });
/**
*/
export const MultiPassEventKindEnum = Object.freeze({ FriendRequestReceived:0,"0":"FriendRequestReceived",FriendRequestSent:1,"1":"FriendRequestSent",IncomingFriendRequestRejected:2,"2":"IncomingFriendRequestRejected",OutgoingFriendRequestRejected:3,"3":"OutgoingFriendRequestRejected",IncomingFriendRequestClosed:4,"4":"IncomingFriendRequestClosed",OutgoingFriendRequestClosed:5,"5":"OutgoingFriendRequestClosed",FriendAdded:6,"6":"FriendAdded",FriendRemoved:7,"7":"FriendRemoved",IdentityOnline:8,"8":"IdentityOnline",IdentityOffline:9,"9":"IdentityOffline",IdentityUpdate:10,"10":"IdentityUpdate",Blocked:11,"11":"Blocked",BlockedBy:12,"12":"BlockedBy",Unblocked:13,"13":"Unblocked",UnblockedBy:14,"14":"UnblockedBy", });
/**
*/
export const MessageEvent = Object.freeze({ Typing:0,"0":"Typing", });
/**
*/
export const TesseractEvent = Object.freeze({ Unlocked:0,"0":"Unlocked",Locked:1,"1":"Locked", });
/**
*/
export const EmbedState = Object.freeze({ Enabled:0,"0":"Enabled",Disable:1,"1":"Disable", });
/**
*/
export const IdentityUpdate = Object.freeze({ Username:0,"0":"Username",Picture:1,"1":"Picture",PicturePath:2,"2":"PicturePath",PictureStream:3,"3":"PictureStream",ClearPicture:4,"4":"ClearPicture",Banner:5,"5":"Banner",BannerPath:6,"6":"BannerPath",BannerStream:7,"7":"BannerStream",ClearBanner:8,"8":"ClearBanner",StatusMessage:9,"9":"StatusMessage",ClearStatusMessage:10,"10":"ClearStatusMessage",AddMetadataKey:11,"11":"AddMetadataKey",RemoveMetadataKey:12,"12":"RemoveMetadataKey", });
/**
*/
export const Identifier = Object.freeze({ DID:0,"0":"DID",DIDList:1,"1":"DIDList",Username:2,"2":"Username", });
/**
*/
export const Platform = Object.freeze({ Desktop:0,"0":"Desktop",Mobile:1,"1":"Mobile",Web:2,"2":"Web",Unknown:3,"3":"Unknown", });
/**
*/
export const MessagesEnum = Object.freeze({ List:0,"0":"List",Stream:1,"1":"Stream",Page:2,"2":"Page", });
/**
*/
export const PinState = Object.freeze({ Pin:0,"0":"Pin",Unpin:1,"1":"Unpin", });
/**
*/
export const MessageStatus = Object.freeze({ NotSent:0,"0":"NotSent",Sent:1,"1":"Sent",Delivered:2,"2":"Delivered", });

const AsyncIteratorFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_asynciterator_free(ptr >>> 0, 1));
/**
* Wraps BoxStream<'static, TesseractEvent> into a js compatible struct
*/
export class AsyncIterator {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(AsyncIterator.prototype);
        obj.__wbg_ptr = ptr;
        AsyncIteratorFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        AsyncIteratorFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_asynciterator_free(ptr, 0);
    }
    /**
    * @returns {Promise<Promise<any>>}
    */
    next() {
        const ret = wasm.asynciterator_next(this.__wbg_ptr);
        return takeObject(ret);
    }
}

const AttachmentFileFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_attachmentfile_free(ptr >>> 0, 1));
/**
*/
export class AttachmentFile {

    static __unwrap(jsValue) {
        if (!(jsValue instanceof AttachmentFile)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        AttachmentFileFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_attachmentfile_free(ptr, 0);
    }
    /**
    * @param {string} file
    * @param {AttachmentStream | undefined} [stream]
    */
    constructor(file, stream) {
        const ptr0 = passStringToWasm0(file, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ptr1 = 0;
        if (!isLikeNone(stream)) {
            _assertClass(stream, AttachmentStream);
            ptr1 = stream.__destroy_into_raw();
        }
        const ret = wasm.attachmentfile_new(ptr0, len0, ptr1);
        this.__wbg_ptr = ret >>> 0;
        AttachmentFileFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}

const AttachmentResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_attachmentresult_free(ptr >>> 0, 1));
/**
*/
export class AttachmentResult {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(AttachmentResult.prototype);
        obj.__wbg_ptr = ptr;
        AttachmentResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        AttachmentResultFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_attachmentresult_free(ptr, 0);
    }
    /**
    * @returns {string}
    */
    get_message_id() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.attachmentresult_get_message_id(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @returns {Promise<Promise<any>>}
    */
    next() {
        const ret = wasm.attachmentresult_next(this.__wbg_ptr);
        return takeObject(ret);
    }
}

const AttachmentStreamFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_attachmentstream_free(ptr >>> 0, 1));
/**
*/
export class AttachmentStream {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        AttachmentStreamFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_attachmentstream_free(ptr, 0);
    }
    /**
    * @param {number | undefined} size
    * @param {ReadableStream} stream
    */
    constructor(size, stream) {
        const ret = wasm.attachmentstream_new(!isLikeNone(size), isLikeNone(size) ? 0 : size, addHeapObject(stream));
        this.__wbg_ptr = ret >>> 0;
        AttachmentStreamFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}

const ConfigFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_config_free(ptr >>> 0, 1));
/**
*/
export class Config {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Config.prototype);
        obj.__wbg_ptr = ptr;
        ConfigFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ConfigFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_config_free(ptr, 0);
    }
    /**
    * @param {string} path
    */
    with_path(path) {
        const ptr0 = passStringToWasm0(path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.config_with_path(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @param {boolean} persist
    */
    set_persistence(persist) {
        wasm.config_set_persistence(this.__wbg_ptr, persist);
    }
    /**
    * @param {boolean} enable
    */
    set_relay_enabled(enable) {
        wasm.config_set_relay_enabled(this.__wbg_ptr, enable);
    }
    /**
    * @param {boolean} save
    */
    set_save_phrase(save) {
        wasm.config_set_save_phrase(this.__wbg_ptr, save);
    }
    /**
    * @param {number | undefined} [size]
    */
    set_max_storage_size(size) {
        wasm.config_set_max_storage_size(this.__wbg_ptr, !isLikeNone(size), isLikeNone(size) ? 0 : size);
    }
    /**
    * @param {number | undefined} [size]
    */
    set_max_file_size(size) {
        wasm.config_set_max_file_size(this.__wbg_ptr, !isLikeNone(size), isLikeNone(size) ? 0 : size);
    }
    /**
    * @param {number} size_x
    * @param {number} size_y
    */
    set_thumbnail_size(size_x, size_y) {
        wasm.config_set_thumbnail_size(this.__wbg_ptr, size_x, size_y);
    }
    /**
    * @param {boolean} exact
    */
    with_thumbnail_exact_format(exact) {
        wasm.config_with_thumbnail_exact_format(this.__wbg_ptr, exact);
    }
    /**
    * @returns {Config}
    */
    static development() {
        const ret = wasm.config_development();
        return Config.__wrap(ret);
    }
    /**
    * @returns {Config}
    */
    static testing() {
        const ret = wasm.config_testing();
        return Config.__wrap(ret);
    }
    /**
    * @returns {Config}
    */
    static minimal_testing() {
        const ret = wasm.config_minimal_testing();
        return Config.__wrap(ret);
    }
    /**
    * @returns {Config}
    */
    static minimal_basic() {
        const ret = wasm.config_minimal_basic();
        return Config.__wrap(ret);
    }
    /**
    * @param {(string)[]} addresses
    * @returns {Config}
    */
    static minimal_with_relay(addresses) {
        const ptr0 = passArrayJsValueToWasm0(addresses, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.config_minimal_with_relay(ptr0, len0);
        return Config.__wrap(ret);
    }
}

const ConstellationBoxFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_constellationbox_free(ptr >>> 0, 1));
/**
*/
export class ConstellationBox {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(ConstellationBox.prototype);
        obj.__wbg_ptr = ptr;
        ConstellationBoxFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ConstellationBoxFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_constellationbox_free(ptr, 0);
    }
    /**
    * @returns {Date}
    */
    modified() {
        const ret = wasm.constellationbox_modified(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Directory}
    */
    root_directory() {
        const ret = wasm.constellationbox_root_directory(this.__wbg_ptr);
        return Directory.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    current_size() {
        const ret = wasm.constellationbox_current_size(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @returns {number}
    */
    max_size() {
        const ret = wasm.constellationbox_max_size(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {string} path
    */
    select(path) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.constellationbox_select(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} path
    */
    set_path(path) {
        const ptr0 = passStringToWasm0(path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.constellationbox_set_path(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @returns {string}
    */
    get_path() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.constellationbox_get_path(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    */
    go_back() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.constellationbox_go_back(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {Directory}
    */
    current_directory() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.constellationbox_current_directory(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Directory.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} path
    * @returns {Directory}
    */
    open_directory(path) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.constellationbox_open_directory(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Directory.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} name
    * @param {Uint8Array} buffer
    * @returns {Promise<void>}
    */
    put_buffer(name, buffer) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(buffer, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.constellationbox_put_buffer(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        return takeObject(ret);
    }
    /**
    * @param {string} name
    * @returns {Promise<any>}
    */
    get_buffer(name) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.constellationbox_get_buffer(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * @param {string} name
    * @param {number | undefined} total_size
    * @param {ReadableStream} stream
    * @returns {Promise<AsyncIterator>}
    */
    put_stream(name, total_size, stream) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.constellationbox_put_stream(this.__wbg_ptr, ptr0, len0, !isLikeNone(total_size), isLikeNone(total_size) ? 0 : total_size, addHeapObject(stream));
        return takeObject(ret);
    }
    /**
    * @param {string} name
    * @returns {Promise<AsyncIterator>}
    */
    get_stream(name) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.constellationbox_get_stream(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * @param {string} current
    * @param {string} _new
    * @returns {Promise<void>}
    */
    rename(current, _new) {
        const ptr0 = passStringToWasm0(current, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(_new, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.constellationbox_rename(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        return takeObject(ret);
    }
    /**
    * @param {string} name
    * @param {boolean} recursive
    * @returns {Promise<void>}
    */
    remove(name, recursive) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.constellationbox_remove(this.__wbg_ptr, ptr0, len0, recursive);
        return takeObject(ret);
    }
    /**
    * @param {string} from
    * @param {string} to
    * @returns {Promise<void>}
    */
    move_item(from, to) {
        const ptr0 = passStringToWasm0(from, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(to, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.constellationbox_move_item(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        return takeObject(ret);
    }
    /**
    * @param {string} name
    * @param {boolean} recursive
    * @returns {Promise<void>}
    */
    create_directory(name, recursive) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.constellationbox_create_directory(this.__wbg_ptr, ptr0, len0, recursive);
        return takeObject(ret);
    }
    /**
    * @param {string} path
    * @returns {Promise<void>}
    */
    sync_ref(path) {
        const ptr0 = passStringToWasm0(path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.constellationbox_sync_ref(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
}

const ConversationFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_conversation_free(ptr >>> 0, 1));
/**
*/
export class Conversation {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Conversation.prototype);
        obj.__wbg_ptr = ptr;
        ConversationFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ConversationFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_conversation_free(ptr, 0);
    }
    /**
    * @returns {string}
    */
    id() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.conversation_id(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @returns {string | undefined}
    */
    name() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.conversation_name(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_free(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {string | undefined}
    */
    creator() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.conversation_creator(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_free(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {Date}
    */
    created() {
        const ret = wasm.conversation_created(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Date}
    */
    modified() {
        const ret = wasm.conversation_modified(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @returns {any}
    */
    settings() {
        const ret = wasm.conversation_settings(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @returns {(string)[]}
    */
    recipients() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.conversation_recipients(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const ConversationListFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_conversationlist_free(ptr >>> 0, 1));
/**
*/
export class ConversationList {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(ConversationList.prototype);
        obj.__wbg_ptr = ptr;
        ConversationListFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ConversationListFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_conversationlist_free(ptr, 0);
    }
    /**
    * @returns {(Conversation)[]}
    */
    convs() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.conversationlist_convs(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const DirectConversationSettingsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_directconversationsettings_free(ptr >>> 0, 1));
/**
*/
export class DirectConversationSettings {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        DirectConversationSettingsFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_directconversationsettings_free(ptr, 0);
    }
}

const DirectoryFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_directory_free(ptr >>> 0, 1));
/**
*/
export class Directory {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Directory.prototype);
        obj.__wbg_ptr = ptr;
        DirectoryFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        DirectoryFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_directory_free(ptr, 0);
    }
    /**
    * @param {string} name
    * @returns {Directory}
    */
    static new(name) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.directory_new(ptr0, len0);
        return Directory.__wrap(ret);
    }
    /**
    * @param {string} item_name
    * @returns {boolean}
    */
    has_item(item_name) {
        const ptr0 = passStringToWasm0(item_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.directory_has_item(this.__wbg_ptr, ptr0, len0);
        return ret !== 0;
    }
    /**
    * @param {File} file
    */
    add_file(file) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(file, File);
            var ptr0 = file.__destroy_into_raw();
            wasm.directory_add_file(retptr, this.__wbg_ptr, ptr0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Directory} directory
    */
    add_directory(directory) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(directory, Directory);
            var ptr0 = directory.__destroy_into_raw();
            wasm.directory_add_directory(retptr, this.__wbg_ptr, ptr0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} item_name
    * @returns {number}
    */
    get_item_index(item_name) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(item_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.directory_get_item_index(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return r0 >>> 0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} current_name
    * @param {string} new_name
    */
    rename_item(current_name, new_name) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(current_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(new_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            wasm.directory_rename_item(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} item_name
    * @returns {Item}
    */
    remove_item(item_name) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(item_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.directory_remove_item(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Item.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} directory
    * @param {string} item
    * @returns {Item}
    */
    remove_item_from_path(directory, item) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(directory, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(item, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            wasm.directory_remove_item_from_path(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Item.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} child
    * @param {string} dst
    */
    move_item_to(child, dst) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(child, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(dst, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            wasm.directory_move_item_to(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {(Item)[]}
    */
    get_items() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.directory_get_items(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {(Item)[]} items
    */
    set_items(items) {
        const ptr0 = passArrayJsValueToWasm0(items, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.directory_set_items(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @param {Item} item
    */
    add_item(item) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(item, Item);
            var ptr0 = item.__destroy_into_raw();
            wasm.directory_add_item(retptr, this.__wbg_ptr, ptr0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} item_name
    * @returns {Item}
    */
    get_item(item_name) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(item_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.directory_get_item(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Item.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} item_name
    * @returns {Item}
    */
    find_item(item_name) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(item_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.directory_find_item(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Item.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {(string)[]} item_names
    * @returns {(Item)[]}
    */
    find_all_items(item_names) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayJsValueToWasm0(item_names, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.directory_find_all_items(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v2 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} path
    * @returns {Directory}
    */
    get_last_directory_from_path(path) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.directory_get_last_directory_from_path(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Directory.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} path
    * @returns {Item}
    */
    get_item_by_path(path) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.directory_get_item_by_path(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Item.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {string}
    */
    name() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.directory_name(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @param {string} name
    */
    set_name(name) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.directory_set_name(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @param {any} format
    */
    set_thumbnail_format(format) {
        wasm.directory_set_thumbnail_format(this.__wbg_ptr, addHeapObject(format));
    }
    /**
    * @returns {any}
    */
    thumbnail_format() {
        const ret = wasm.directory_thumbnail_format(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @param {Uint8Array} desc
    */
    set_thumbnail(desc) {
        const ptr0 = passArray8ToWasm0(desc, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.directory_set_thumbnail(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @returns {Uint8Array}
    */
    thumbnail() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.directory_thumbnail(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} reference
    */
    set_thumbnail_reference(reference) {
        const ptr0 = passStringToWasm0(reference, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.directory_set_thumbnail_reference(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @returns {string | undefined}
    */
    thumbnail_reference() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.directory_thumbnail_reference(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_free(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {boolean} fav
    */
    set_favorite(fav) {
        wasm.directory_set_favorite(this.__wbg_ptr, fav);
    }
    /**
    * @returns {boolean}
    */
    favorite() {
        const ret = wasm.directory_favorite(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
    * @returns {string}
    */
    description() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.directory_description(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @param {string} desc
    */
    set_description(desc) {
        const ptr0 = passStringToWasm0(desc, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.directory_set_description(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @returns {number}
    */
    size() {
        const ret = wasm.directory_size(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {Date} creation
    */
    set_creation(creation) {
        wasm.directory_set_creation(this.__wbg_ptr, addHeapObject(creation));
    }
    /**
    * @param {Date | undefined} [modified]
    */
    set_modified(modified) {
        wasm.directory_set_modified(this.__wbg_ptr, isLikeNone(modified) ? 0 : addHeapObject(modified));
    }
    /**
    * @returns {string}
    */
    path() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.directory_path(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @param {string} new_path
    */
    set_path(new_path) {
        const ptr0 = passStringToWasm0(new_path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.directory_set_path(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @returns {string}
    */
    id() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.directory_id(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @returns {Date}
    */
    creation() {
        const ret = wasm.directory_creation(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Date}
    */
    modified() {
        const ret = wasm.directory_modified(this.__wbg_ptr);
        return takeObject(ret);
    }
}

const FileFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_file_free(ptr >>> 0, 1));
/**
*/
export class File {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(File.prototype);
        obj.__wbg_ptr = ptr;
        FileFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FileFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_file_free(ptr, 0);
    }
    /**
    * @param {string} name
    * @returns {File}
    */
    static new(name) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.file_new(ptr0, len0);
        return File.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    name() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.file_name(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @param {string} id
    */
    set_id(id) {
        const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.file_set_id(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @param {string} name
    */
    set_name(name) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.file_set_name(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @returns {string}
    */
    description() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.file_description(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @param {string} desc
    */
    set_description(desc) {
        const ptr0 = passStringToWasm0(desc, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.file_set_description(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @param {any} format
    */
    set_thumbnail_format(format) {
        wasm.file_set_thumbnail_format(this.__wbg_ptr, addHeapObject(format));
    }
    /**
    * @returns {any}
    */
    thumbnail_format() {
        const ret = wasm.file_thumbnail_format(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @param {Uint8Array} data
    */
    set_thumbnail(data) {
        const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.file_set_thumbnail(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @returns {Uint8Array}
    */
    thumbnail() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.file_thumbnail(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {boolean} fav
    */
    set_favorite(fav) {
        wasm.file_set_favorite(this.__wbg_ptr, fav);
    }
    /**
    * @returns {boolean}
    */
    favorite() {
        const ret = wasm.file_favorite(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
    * @param {string} reference
    */
    set_reference(reference) {
        const ptr0 = passStringToWasm0(reference, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.file_set_reference(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @param {string} reference
    */
    set_thumbnail_reference(reference) {
        const ptr0 = passStringToWasm0(reference, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.file_set_thumbnail_reference(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @returns {string | undefined}
    */
    reference() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.file_reference(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_free(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {string | undefined}
    */
    thumbnail_reference() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.file_thumbnail_reference(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_free(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {number}
    */
    size() {
        const ret = wasm.file_size(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} size
    */
    set_size(size) {
        wasm.file_set_size(this.__wbg_ptr, size);
    }
    /**
    * @param {Date} creation
    */
    set_creation(creation) {
        wasm.file_set_creation(this.__wbg_ptr, addHeapObject(creation));
    }
    /**
    * @param {Date | undefined} [modified]
    */
    set_modified(modified) {
        wasm.file_set_modified(this.__wbg_ptr, isLikeNone(modified) ? 0 : addHeapObject(modified));
    }
    /**
    * @returns {Hash}
    */
    hash() {
        const ret = wasm.file_hash(this.__wbg_ptr);
        return Hash.__wrap(ret);
    }
    /**
    * @param {Hash} hash
    */
    set_hash(hash) {
        _assertClass(hash, Hash);
        var ptr0 = hash.__destroy_into_raw();
        wasm.file_set_hash(this.__wbg_ptr, ptr0);
    }
    /**
    * @param {any} file_type
    */
    set_file_type(file_type) {
        wasm.file_set_file_type(this.__wbg_ptr, addHeapObject(file_type));
    }
    /**
    * @returns {any}
    */
    file_type() {
        const ret = wasm.file_file_type(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @returns {string}
    */
    path() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.file_path(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @param {string} new_path
    */
    set_path(new_path) {
        const ptr0 = passStringToWasm0(new_path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.file_set_path(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @returns {string}
    */
    id() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.file_id(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @returns {Date}
    */
    creation() {
        const ret = wasm.file_creation(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Date}
    */
    modified() {
        const ret = wasm.file_modified(this.__wbg_ptr);
        return takeObject(ret);
    }
}

const GroupSettingsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_groupsettings_free(ptr >>> 0, 1));
/**
*/
export class GroupSettings {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        GroupSettingsFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_groupsettings_free(ptr, 0);
    }
    /**
    */
    constructor() {
        const ret = wasm.groupsettings_new();
        this.__wbg_ptr = ret >>> 0;
        GroupSettingsFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
    * @returns {boolean}
    */
    members_can_add_participants() {
        const ret = wasm.groupsettings_members_can_add_participants(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
    * @returns {boolean}
    */
    members_can_change_name() {
        const ret = wasm.groupsettings_members_can_change_name(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
    * @param {boolean} val
    */
    set_members_can_add_participants(val) {
        wasm.groupsettings_set_members_can_add_participants(this.__wbg_ptr, val);
    }
    /**
    * @param {boolean} val
    */
    set_members_can_change_name(val) {
        wasm.groupsettings_set_members_can_change_name(this.__wbg_ptr, val);
    }
}

const HashFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_hash_free(ptr >>> 0, 1));
/**
*/
export class Hash {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Hash.prototype);
        obj.__wbg_ptr = ptr;
        HashFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        HashFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_hash_free(ptr, 0);
    }
    /**
    * @returns {string | undefined}
    */
    sha256() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.hash_sha256(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_free(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const IdentityFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_identity_free(ptr >>> 0, 1));
/**
*/
export class Identity {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Identity.prototype);
        obj.__wbg_ptr = ptr;
        IdentityFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        IdentityFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_identity_free(ptr, 0);
    }
    /**
    * @returns {string}
    */
    username() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.identity_username(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @returns {string | undefined}
    */
    status_message() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.identity_status_message(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_free(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {string}
    */
    short_id() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.identity_short_id(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @returns {string}
    */
    did_key() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.identity_did_key(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @returns {Date}
    */
    created() {
        const ret = wasm.identity_created(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Date}
    */
    modified() {
        const ret = wasm.identity_modified(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @returns {any}
    */
    metadata() {
        const ret = wasm.identity_metadata(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} user
    */
    set_username(user) {
        const ptr0 = passStringToWasm0(user, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.identity_set_username(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @param {string | undefined} [message]
    */
    set_status_message(message) {
        var ptr0 = isLikeNone(message) ? 0 : passStringToWasm0(message, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.identity_set_status_message(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @param {string} id
    */
    set_short_id(id) {
        const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.identity_set_short_id(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @param {string} pubkey
    */
    set_did_key(pubkey) {
        const ptr0 = passStringToWasm0(pubkey, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.identity_set_did_key(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @param {Date} time
    */
    set_created(time) {
        wasm.identity_set_created(this.__wbg_ptr, addHeapObject(time));
    }
    /**
    * @param {Date} time
    */
    set_modified(time) {
        wasm.identity_set_modified(this.__wbg_ptr, addHeapObject(time));
    }
    /**
    * @param {Map<any, any>} map
    */
    set_metadata(map) {
        wasm.identity_set_metadata(this.__wbg_ptr, addHeapObject(map));
    }
}

const IdentityImageFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_identityimage_free(ptr >>> 0, 1));
/**
*/
export class IdentityImage {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(IdentityImage.prototype);
        obj.__wbg_ptr = ptr;
        IdentityImageFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        IdentityImageFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_identityimage_free(ptr, 0);
    }
    /**
    * @returns {Uint8Array}
    */
    data() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.identityimage_data(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {any}
    */
    image_type() {
        const ret = wasm.identityimage_image_type(this.__wbg_ptr);
        return takeObject(ret);
    }
}

const IdentityProfileFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_identityprofile_free(ptr >>> 0, 1));
/**
*/
export class IdentityProfile {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(IdentityProfile.prototype);
        obj.__wbg_ptr = ptr;
        IdentityProfileFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        IdentityProfileFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_identityprofile_free(ptr, 0);
    }
    /**
    * @returns {Identity}
    */
    identity() {
        const ret = wasm.identityprofile_identity(this.__wbg_ptr);
        return Identity.__wrap(ret);
    }
    /**
    * @returns {string | undefined}
    */
    passphrase() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.identityprofile_passphrase(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_free(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const IntoUnderlyingByteSourceFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_intounderlyingbytesource_free(ptr >>> 0, 1));
/**
*/
export class IntoUnderlyingByteSource {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        IntoUnderlyingByteSourceFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_intounderlyingbytesource_free(ptr, 0);
    }
    /**
    * @returns {string}
    */
    get type() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.intounderlyingbytesource_type(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @returns {number}
    */
    get autoAllocateChunkSize() {
        const ret = wasm.intounderlyingbytesource_autoAllocateChunkSize(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {ReadableByteStreamController} controller
    */
    start(controller) {
        wasm.intounderlyingbytesource_start(this.__wbg_ptr, addHeapObject(controller));
    }
    /**
    * @param {ReadableByteStreamController} controller
    * @returns {Promise<any>}
    */
    pull(controller) {
        const ret = wasm.intounderlyingbytesource_pull(this.__wbg_ptr, addHeapObject(controller));
        return takeObject(ret);
    }
    /**
    */
    cancel() {
        const ptr = this.__destroy_into_raw();
        wasm.intounderlyingbytesource_cancel(ptr);
    }
}

const IntoUnderlyingSinkFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_intounderlyingsink_free(ptr >>> 0, 1));
/**
*/
export class IntoUnderlyingSink {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        IntoUnderlyingSinkFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_intounderlyingsink_free(ptr, 0);
    }
    /**
    * @param {any} chunk
    * @returns {Promise<any>}
    */
    write(chunk) {
        const ret = wasm.intounderlyingsink_write(this.__wbg_ptr, addHeapObject(chunk));
        return takeObject(ret);
    }
    /**
    * @returns {Promise<any>}
    */
    close() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.intounderlyingsink_close(ptr);
        return takeObject(ret);
    }
    /**
    * @param {any} reason
    * @returns {Promise<any>}
    */
    abort(reason) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.intounderlyingsink_abort(ptr, addHeapObject(reason));
        return takeObject(ret);
    }
}

const IntoUnderlyingSourceFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_intounderlyingsource_free(ptr >>> 0, 1));
/**
*/
export class IntoUnderlyingSource {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        IntoUnderlyingSourceFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_intounderlyingsource_free(ptr, 0);
    }
    /**
    * @param {ReadableStreamDefaultController} controller
    * @returns {Promise<any>}
    */
    pull(controller) {
        const ret = wasm.intounderlyingsource_pull(this.__wbg_ptr, addHeapObject(controller));
        return takeObject(ret);
    }
    /**
    */
    cancel() {
        const ptr = this.__destroy_into_raw();
        wasm.intounderlyingsource_cancel(ptr);
    }
}

const ItemFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_item_free(ptr >>> 0, 1));
/**
*/
export class Item {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Item.prototype);
        obj.__wbg_ptr = ptr;
        ItemFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    static __unwrap(jsValue) {
        if (!(jsValue instanceof Item)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ItemFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_item_free(ptr, 0);
    }
    /**
    * @param {File} file
    * @returns {Item}
    */
    static new_file(file) {
        _assertClass(file, File);
        var ptr0 = file.__destroy_into_raw();
        const ret = wasm.item_new_file(ptr0);
        return Item.__wrap(ret);
    }
    /**
    * @param {Directory} directory
    * @returns {Item}
    */
    static new_directory(directory) {
        _assertClass(directory, Directory);
        var ptr0 = directory.__destroy_into_raw();
        const ret = wasm.item_new_directory(ptr0);
        return Item.__wrap(ret);
    }
    /**
    * @returns {File | undefined}
    */
    file() {
        const ret = wasm.item_file(this.__wbg_ptr);
        return ret === 0 ? undefined : File.__wrap(ret);
    }
    /**
    * @returns {Directory | undefined}
    */
    directory() {
        const ret = wasm.item_directory(this.__wbg_ptr);
        return ret === 0 ? undefined : Directory.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    id() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.item_id(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @returns {Date}
    */
    creation() {
        const ret = wasm.item_creation(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Date}
    */
    modified() {
        const ret = wasm.item_modified(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @returns {string}
    */
    name() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.item_name(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @returns {string}
    */
    description() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.item_description(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @returns {number}
    */
    size() {
        const ret = wasm.item_size(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @returns {any}
    */
    thumbnail_format() {
        const ret = wasm.item_thumbnail_format(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    thumbnail() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.item_thumbnail(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {boolean}
    */
    favorite() {
        const ret = wasm.item_favorite(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
    * @param {boolean} fav
    */
    set_favorite(fav) {
        wasm.item_set_favorite(this.__wbg_ptr, fav);
    }
    /**
    * @param {string} name
    */
    rename(name) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.item_rename(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {boolean}
    */
    is_directory() {
        const ret = wasm.item_is_directory(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
    * @returns {boolean}
    */
    is_file() {
        const ret = wasm.item_is_file(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
    * @returns {ItemType}
    */
    item_type() {
        const ret = wasm.item_is_directory(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {string} desc
    */
    set_description(desc) {
        const ptr0 = passStringToWasm0(desc, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.item_set_description(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @param {Uint8Array} data
    */
    set_thumbnail(data) {
        const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.item_set_thumbnail(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @param {any} format
    */
    set_thumbnail_format(format) {
        wasm.item_set_thumbnail_format(this.__wbg_ptr, addHeapObject(format));
    }
    /**
    * @param {number} size
    */
    set_size(size) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.item_set_size(retptr, this.__wbg_ptr, size);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {string}
    */
    path() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.item_path(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @param {string} new_path
    */
    set_path(new_path) {
        const ptr0 = passStringToWasm0(new_path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.item_set_path(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @returns {Directory}
    */
    get_directory() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.item_get_directory(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Directory.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {File}
    */
    get_file() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.item_get_file(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return File.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const MessageFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_message_free(ptr >>> 0, 1));
/**
*/
export class Message {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Message.prototype);
        obj.__wbg_ptr = ptr;
        MessageFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        MessageFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_message_free(ptr, 0);
    }
    /**
    * @returns {string}
    */
    id() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.message_id(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @returns {MessageType}
    */
    message_type() {
        const ret = wasm.message_message_type(this.__wbg_ptr);
        return ret;
    }
    /**
    * @returns {string}
    */
    conversation_id() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.message_conversation_id(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @returns {string}
    */
    sender() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.message_sender(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @returns {Date}
    */
    date() {
        const ret = wasm.message_date(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Date | undefined}
    */
    modified() {
        const ret = wasm.message_modified(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @returns {boolean}
    */
    pinned() {
        const ret = wasm.message_pinned(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
    * @returns {any}
    */
    reactions() {
        const ret = wasm.message_reactions(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @returns {(string)[]}
    */
    mentions() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.message_mentions(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {(string)[]}
    */
    lines() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.message_lines(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {any[]}
    */
    attachments() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.message_attachments(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {any}
    */
    metadata() {
        const ret = wasm.message_metadata(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @returns {string | undefined}
    */
    replied() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.message_replied(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_free(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const MessageOptionsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_messageoptions_free(ptr >>> 0, 1));
/**
*/
export class MessageOptions {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        MessageOptionsFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_messageoptions_free(ptr, 0);
    }
    /**
    */
    constructor() {
        const ret = wasm.messageoptions_new();
        this.__wbg_ptr = ret >>> 0;
        MessageOptionsFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
    * @param {any} range
    */
    set_date_range(range) {
        wasm.messageoptions_set_date_range(this.__wbg_ptr, addHeapObject(range));
    }
    /**
    * @param {any} range
    */
    set_range(range) {
        wasm.messageoptions_set_range(this.__wbg_ptr, addHeapObject(range));
    }
    /**
    * @param {number} limit
    */
    set_limit(limit) {
        wasm.messageoptions_set_limit(this.__wbg_ptr, limit);
    }
    /**
    * @param {bigint} skip
    */
    set_skip(skip) {
        wasm.messageoptions_set_skip(this.__wbg_ptr, skip);
    }
    /**
    * @param {string} keyword
    */
    set_keyword(keyword) {
        const ptr0 = passStringToWasm0(keyword, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.messageoptions_set_keyword(this.__wbg_ptr, ptr0, len0);
    }
    /**
    */
    set_first_message() {
        wasm.messageoptions_set_first_message(this.__wbg_ptr);
    }
    /**
    */
    set_last_message() {
        wasm.messageoptions_set_last_message(this.__wbg_ptr);
    }
    /**
    */
    set_pinned() {
        wasm.messageoptions_set_pinned(this.__wbg_ptr);
    }
    /**
    */
    set_reverse() {
        wasm.messageoptions_set_reverse(this.__wbg_ptr);
    }
    /**
    * @param {any} ty
    */
    set_messages_type(ty) {
        wasm.messageoptions_set_messages_type(this.__wbg_ptr, addHeapObject(ty));
    }
}

const MessageReferenceFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_messagereference_free(ptr >>> 0, 1));
/**
*/
export class MessageReference {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(MessageReference.prototype);
        obj.__wbg_ptr = ptr;
        MessageReferenceFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        MessageReferenceFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_messagereference_free(ptr, 0);
    }
    /**
    * @returns {string}
    */
    id() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.messagereference_id(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @returns {string}
    */
    conversation_id() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.messagereference_conversation_id(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @returns {string}
    */
    sender() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.messagereference_sender(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @returns {Date}
    */
    date() {
        const ret = wasm.messagereference_date(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Date | undefined}
    */
    modified() {
        const ret = wasm.messagereference_modified(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @returns {boolean}
    */
    pinned() {
        const ret = wasm.messagereference_pinned(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
    * @returns {string | undefined}
    */
    replied() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.messagereference_replied(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_free(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {boolean}
    */
    deleted() {
        const ret = wasm.messagereference_deleted(this.__wbg_ptr);
        return ret !== 0;
    }
}

const MessagesFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_messages_free(ptr >>> 0, 1));
/**
*/
export class Messages {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Messages.prototype);
        obj.__wbg_ptr = ptr;
        MessagesFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        MessagesFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_messages_free(ptr, 0);
    }
    /**
    * @returns {MessagesEnum}
    */
    variant() {
        const ret = wasm.messages_variant(this.__wbg_ptr);
        return ret;
    }
    /**
    * @returns {any}
    */
    value() {
        const ret = wasm.messages_value(this.__wbg_ptr);
        return takeObject(ret);
    }
}

const MultiPassBoxFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_multipassbox_free(ptr >>> 0, 1));
/**
*/
export class MultiPassBox {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(MultiPassBox.prototype);
        obj.__wbg_ptr = ptr;
        MultiPassBoxFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        MultiPassBoxFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_multipassbox_free(ptr, 0);
    }
    /**
    * @param {string | undefined} [username]
    * @param {string | undefined} [passphrase]
    * @returns {Promise<IdentityProfile>}
    */
    create_identity(username, passphrase) {
        var ptr0 = isLikeNone(username) ? 0 : passStringToWasm0(username, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(passphrase) ? 0 : passStringToWasm0(passphrase, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        const ret = wasm.multipassbox_create_identity(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        return takeObject(ret);
    }
    /**
    * @param {Identifier} id_variant
    * @param {any} id_value
    * @returns {Promise<any>}
    */
    get_identity(id_variant, id_value) {
        const ret = wasm.multipassbox_get_identity(this.__wbg_ptr, id_variant, addHeapObject(id_value));
        return takeObject(ret);
    }
    /**
    * @returns {Promise<Identity>}
    */
    identity() {
        const ret = wasm.multipassbox_identity(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Tesseract}
    */
    tesseract() {
        const ret = wasm.multipassbox_tesseract(this.__wbg_ptr);
        return Tesseract.__wrap(ret);
    }
    /**
    * @param {IdentityUpdate} option
    * @param {any} value
    * @returns {Promise<void>}
    */
    update_identity(option, value) {
        const ret = wasm.multipassbox_update_identity(this.__wbg_ptr, option, addHeapObject(value));
        return takeObject(ret);
    }
    /**
    * @returns {Promise<AsyncIterator>}
    */
    multipass_subscribe() {
        const ret = wasm.multipassbox_multipass_subscribe(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * Send friend request to corresponding public key
    * @param {string} pubkey
    * @returns {Promise<void>}
    */
    send_request(pubkey) {
        const ptr0 = passStringToWasm0(pubkey, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.multipassbox_send_request(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * Accept friend request from public key
    * @param {string} pubkey
    * @returns {Promise<void>}
    */
    accept_request(pubkey) {
        const ptr0 = passStringToWasm0(pubkey, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.multipassbox_accept_request(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * Deny friend request from public key
    * @param {string} pubkey
    * @returns {Promise<void>}
    */
    deny_request(pubkey) {
        const ptr0 = passStringToWasm0(pubkey, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.multipassbox_deny_request(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * Closing or retracting friend request
    * @param {string} pubkey
    * @returns {Promise<void>}
    */
    close_request(pubkey) {
        const ptr0 = passStringToWasm0(pubkey, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.multipassbox_close_request(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * Check to determine if a request been received from the DID
    * @param {string} pubkey
    * @returns {Promise<boolean>}
    */
    received_friend_request_from(pubkey) {
        const ptr0 = passStringToWasm0(pubkey, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.multipassbox_received_friend_request_from(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * List the incoming friend request
    * @returns {Promise<any>}
    */
    list_incoming_request() {
        const ret = wasm.multipassbox_list_incoming_request(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * Check to determine if a request been sent to the DID
    * @param {string} pubkey
    * @returns {Promise<boolean>}
    */
    sent_friend_request_to(pubkey) {
        const ptr0 = passStringToWasm0(pubkey, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.multipassbox_sent_friend_request_to(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * List the outgoing friend request
    * @returns {Promise<any>}
    */
    list_outgoing_request() {
        const ret = wasm.multipassbox_list_outgoing_request(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * Remove friend from contacts
    * @param {string} pubkey
    * @returns {Promise<void>}
    */
    remove_friend(pubkey) {
        const ptr0 = passStringToWasm0(pubkey, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.multipassbox_remove_friend(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * Block public key, rather it be a friend or not, from being able to send request to account public address
    * @param {string} pubkey
    * @returns {Promise<void>}
    */
    block(pubkey) {
        const ptr0 = passStringToWasm0(pubkey, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.multipassbox_block(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * Unblock public key
    * @param {string} pubkey
    * @returns {Promise<void>}
    */
    unblock(pubkey) {
        const ptr0 = passStringToWasm0(pubkey, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.multipassbox_unblock(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * List block list
    * @returns {Promise<any>}
    */
    block_list() {
        const ret = wasm.multipassbox_block_list(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * Check to see if public key is blocked
    * @param {string} pubkey
    * @returns {Promise<boolean>}
    */
    is_blocked(pubkey) {
        const ptr0 = passStringToWasm0(pubkey, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.multipassbox_is_blocked(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * List all friends public key
    * @returns {Promise<any>}
    */
    list_friends() {
        const ret = wasm.multipassbox_list_friends(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * Check to see if public key is friend of the account
    * @param {string} pubkey
    * @returns {Promise<boolean>}
    */
    has_friend(pubkey) {
        const ptr0 = passStringToWasm0(pubkey, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.multipassbox_has_friend(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * Profile picture belonging to the `Identity`
    * @param {string} did
    * @returns {Promise<IdentityImage>}
    */
    identity_picture(did) {
        const ptr0 = passStringToWasm0(did, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.multipassbox_identity_picture(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * Profile banner belonging to the `Identity`
    * @param {string} did
    * @returns {Promise<IdentityImage>}
    */
    identity_banner(did) {
        const ptr0 = passStringToWasm0(did, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.multipassbox_identity_banner(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * Identity status to determine if they are online or offline
    * @param {string} did
    * @returns {Promise<IdentityStatus>}
    */
    identity_status(did) {
        const ptr0 = passStringToWasm0(did, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.multipassbox_identity_status(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * Identity status to determine if they are online or offline
    * @param {IdentityStatus} status
    * @returns {Promise<void>}
    */
    set_identity_status(status) {
        const ret = wasm.multipassbox_set_identity_status(this.__wbg_ptr, status);
        return takeObject(ret);
    }
    /**
    * Find the relationship with an existing identity.
    * @param {string} did
    * @returns {Promise<Relationship>}
    */
    identity_relationship(did) {
        const ptr0 = passStringToWasm0(did, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.multipassbox_identity_relationship(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * Returns the identity platform while online.
    * @param {string} did
    * @returns {Promise<Platform>}
    */
    identity_platform(did) {
        const ptr0 = passStringToWasm0(did, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.multipassbox_identity_platform(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
}

const MultiPassEventKindFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_multipasseventkind_free(ptr >>> 0, 1));
/**
*/
export class MultiPassEventKind {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(MultiPassEventKind.prototype);
        obj.__wbg_ptr = ptr;
        MultiPassEventKindFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        MultiPassEventKindFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_multipasseventkind_free(ptr, 0);
    }
    /**
    * @returns {MultiPassEventKindEnum}
    */
    get kind() {
        const ret = wasm.multipasseventkind_kind(this.__wbg_ptr);
        return ret;
    }
    /**
    * @returns {string}
    */
    get did() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.multipasseventkind_did(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}

const PromiseResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_promiseresult_free(ptr >>> 0, 1));
/**
* Wraps in the TesseractEvent promise result in the js object expected by js async iterator
*/
export class PromiseResult {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(PromiseResult.prototype);
        obj.__wbg_ptr = ptr;
        PromiseResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PromiseResultFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_promiseresult_free(ptr, 0);
    }
    /**
    * @returns {boolean}
    */
    get done() {
        const ret = wasm.__wbg_get_promiseresult_done(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
    * @param {boolean} arg0
    */
    set done(arg0) {
        wasm.__wbg_set_promiseresult_done(this.__wbg_ptr, arg0);
    }
    /**
    * @param {any} value
    * @returns {PromiseResult}
    */
    static new(value) {
        const ret = wasm.promiseresult_new(addHeapObject(value));
        return PromiseResult.__wrap(ret);
    }
    /**
    * @returns {any}
    */
    get value() {
        const ret = wasm.promiseresult_value(this.__wbg_ptr);
        return takeObject(ret);
    }
}

const RayGunBoxFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_raygunbox_free(ptr >>> 0, 1));
/**
*/
export class RayGunBox {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(RayGunBox.prototype);
        obj.__wbg_ptr = ptr;
        RayGunBoxFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RayGunBoxFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_raygunbox_free(ptr, 0);
    }
    /**
    * @param {string} did
    * @returns {Promise<Conversation>}
    */
    create_conversation(did) {
        const ptr0 = passStringToWasm0(did, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.raygunbox_create_conversation(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * @param {string | undefined} name
    * @param {(string)[]} recipients
    * @param {GroupSettings} settings
    * @returns {Promise<Conversation>}
    */
    create_group_conversation(name, recipients, settings) {
        var ptr0 = isLikeNone(name) ? 0 : passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayJsValueToWasm0(recipients, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        _assertClass(settings, GroupSettings);
        var ptr2 = settings.__destroy_into_raw();
        const ret = wasm.raygunbox_create_group_conversation(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2);
        return takeObject(ret);
    }
    /**
    * Get an active conversation
    * @param {string} conversation_id
    * @returns {Promise<Conversation>}
    */
    get_conversation(conversation_id) {
        const ptr0 = passStringToWasm0(conversation_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.raygunbox_get_conversation(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * @param {string} conversation_id
    * @param {boolean} favorite
    * @returns {Promise<void>}
    */
    set_favorite_conversation(conversation_id, favorite) {
        const ptr0 = passStringToWasm0(conversation_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.raygunbox_set_favorite_conversation(this.__wbg_ptr, ptr0, len0, favorite);
        return takeObject(ret);
    }
    /**
    * List all active conversations
    * @returns {Promise<ConversationList>}
    */
    list_conversations() {
        const ret = wasm.raygunbox_list_conversations(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * Retrieve all messages from a conversation
    * @param {string} conversation_id
    * @param {string} message_id
    * @returns {Promise<Message>}
    */
    get_message(conversation_id, message_id) {
        const ptr0 = passStringToWasm0(conversation_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(message_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.raygunbox_get_message(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        return takeObject(ret);
    }
    /**
    * Get a number of messages in a conversation
    * @param {string} conversation_id
    * @returns {Promise<number>}
    */
    get_message_count(conversation_id) {
        const ptr0 = passStringToWasm0(conversation_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.raygunbox_get_message_count(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * Get a status of a message in a conversation
    * @param {string} conversation_id
    * @param {string} message_id
    * @returns {Promise<MessageStatus>}
    */
    message_status(conversation_id, message_id) {
        const ptr0 = passStringToWasm0(conversation_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(message_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.raygunbox_message_status(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        return takeObject(ret);
    }
    /**
    * Retrieve all message references from a conversation
    * @param {string} conversation_id
    * @param {MessageOptions} options
    * @returns {Promise<AsyncIterator>}
    */
    get_message_references(conversation_id, options) {
        const ptr0 = passStringToWasm0(conversation_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(options, MessageOptions);
        var ptr1 = options.__destroy_into_raw();
        const ret = wasm.raygunbox_get_message_references(this.__wbg_ptr, ptr0, len0, ptr1);
        return takeObject(ret);
    }
    /**
    * Retrieve a message reference from a conversation
    * @param {string} conversation_id
    * @param {string} message_id
    * @returns {Promise<MessageReference>}
    */
    get_message_reference(conversation_id, message_id) {
        const ptr0 = passStringToWasm0(conversation_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(message_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.raygunbox_get_message_reference(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        return takeObject(ret);
    }
    /**
    * Retrieve all messages from a conversation
    * @param {string} conversation_id
    * @param {MessageOptions} options
    * @returns {Promise<Messages>}
    */
    get_messages(conversation_id, options) {
        const ptr0 = passStringToWasm0(conversation_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(options, MessageOptions);
        var ptr1 = options.__destroy_into_raw();
        const ret = wasm.raygunbox_get_messages(this.__wbg_ptr, ptr0, len0, ptr1);
        return takeObject(ret);
    }
    /**
    * Sends a message to a conversation.
    * @param {string} conversation_id
    * @param {(string)[]} message
    * @returns {Promise<string>}
    */
    send(conversation_id, message) {
        const ptr0 = passStringToWasm0(conversation_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayJsValueToWasm0(message, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.raygunbox_send(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        return takeObject(ret);
    }
    /**
    * Edit an existing message in a conversation.
    * @param {string} conversation_id
    * @param {string} message_id
    * @param {(string)[]} message
    * @returns {Promise<void>}
    */
    edit(conversation_id, message_id, message) {
        const ptr0 = passStringToWasm0(conversation_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(message_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArrayJsValueToWasm0(message, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ret = wasm.raygunbox_edit(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2);
        return takeObject(ret);
    }
    /**
    * Delete message from a conversation
    * @param {string} conversation_id
    * @param {string | undefined} [message_id]
    * @returns {Promise<void>}
    */
    delete(conversation_id, message_id) {
        const ptr0 = passStringToWasm0(conversation_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(message_id) ? 0 : passStringToWasm0(message_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        const ret = wasm.raygunbox_delete(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        return takeObject(ret);
    }
    /**
    * React to a message
    * @param {string} conversation_id
    * @param {string} message_id
    * @param {ReactionState} state
    * @param {string} emoji
    * @returns {Promise<void>}
    */
    react(conversation_id, message_id, state, emoji) {
        const ptr0 = passStringToWasm0(conversation_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(message_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(emoji, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        const ret = wasm.raygunbox_react(this.__wbg_ptr, ptr0, len0, ptr1, len1, state, ptr2, len2);
        return takeObject(ret);
    }
    /**
    * Pin a message within a conversation
    * @param {string} conversation_id
    * @param {string} message_id
    * @param {PinState} state
    * @returns {Promise<void>}
    */
    pin(conversation_id, message_id, state) {
        const ptr0 = passStringToWasm0(conversation_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(message_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.raygunbox_pin(this.__wbg_ptr, ptr0, len0, ptr1, len1, state);
        return takeObject(ret);
    }
    /**
    * Reply to a message within a conversation
    * @param {string} conversation_id
    * @param {string} message_id
    * @param {(string)[]} message
    * @returns {Promise<string>}
    */
    reply(conversation_id, message_id, message) {
        const ptr0 = passStringToWasm0(conversation_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(message_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArrayJsValueToWasm0(message, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ret = wasm.raygunbox_reply(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2);
        return takeObject(ret);
    }
    /**
    * @param {string} conversation_id
    * @param {string} message_id
    * @param {EmbedState} state
    * @returns {Promise<void>}
    */
    embeds(conversation_id, message_id, state) {
        const ptr0 = passStringToWasm0(conversation_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(message_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.raygunbox_embeds(this.__wbg_ptr, ptr0, len0, ptr1, len1, state);
        return takeObject(ret);
    }
    /**
    * Update conversation settings
    * @param {string} conversation_id
    * @param {any} settings
    * @returns {Promise<void>}
    */
    update_conversation_settings(conversation_id, settings) {
        const ptr0 = passStringToWasm0(conversation_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.raygunbox_update_conversation_settings(this.__wbg_ptr, ptr0, len0, addHeapObject(settings));
        return takeObject(ret);
    }
    /**
    * @param {string} conversation_id
    * @param {string} name
    * @returns {Promise<void>}
    */
    update_conversation_name(conversation_id, name) {
        const ptr0 = passStringToWasm0(conversation_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.raygunbox_update_conversation_name(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        return takeObject(ret);
    }
    /**
    * Add a recipient to the conversation
    * @param {string} conversation_id
    * @param {string} recipient
    * @returns {Promise<void>}
    */
    add_recipient(conversation_id, recipient) {
        const ptr0 = passStringToWasm0(conversation_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(recipient, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.raygunbox_add_recipient(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        return takeObject(ret);
    }
    /**
    * Remove a recipient from the conversation
    * @param {string} conversation_id
    * @param {string} recipient
    * @returns {Promise<void>}
    */
    remove_recipient(conversation_id, recipient) {
        const ptr0 = passStringToWasm0(conversation_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(recipient, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.raygunbox_remove_recipient(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        return takeObject(ret);
    }
    /**
    * Send files to a conversation.
    * If no files is provided in the array, it will throw an error
    * @param {string} conversation_id
    * @param {string | undefined} message_id
    * @param {(AttachmentFile)[]} files
    * @param {(string)[]} message
    * @returns {Promise<AttachmentResult>}
    */
    attach(conversation_id, message_id, files, message) {
        const ptr0 = passStringToWasm0(conversation_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(message_id) ? 0 : passStringToWasm0(message_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        const ptr2 = passArrayJsValueToWasm0(files, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passArrayJsValueToWasm0(message, wasm.__wbindgen_malloc);
        const len3 = WASM_VECTOR_LEN;
        const ret = wasm.raygunbox_attach(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);
        return takeObject(ret);
    }
    /**
    * Stream a file that been attached to a message
    * Note: Must use the filename associated when downloading
    * @param {string} conversation_id
    * @param {string} message_id
    * @param {string} file
    * @returns {Promise<AsyncIterator>}
    */
    download_stream(conversation_id, message_id, file) {
        const ptr0 = passStringToWasm0(conversation_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(message_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(file, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        const ret = wasm.raygunbox_download_stream(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2);
        return takeObject(ret);
    }
    /**
    * Subscribe to an stream of events from the conversation
    * @param {string} conversation_id
    * @returns {Promise<AsyncIterator>}
    */
    get_conversation_stream(conversation_id) {
        const ptr0 = passStringToWasm0(conversation_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.raygunbox_get_conversation_stream(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * Subscribe to an stream of events
    * @returns {Promise<AsyncIterator>}
    */
    raygun_subscribe() {
        const ret = wasm.raygunbox_raygun_subscribe(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * Send an event to a conversation
    * @param {string} conversation_id
    * @param {MessageEvent} event
    * @returns {Promise<void>}
    */
    send_event(conversation_id, event) {
        const ptr0 = passStringToWasm0(conversation_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.raygunbox_send_event(this.__wbg_ptr, ptr0, len0, event);
        return takeObject(ret);
    }
    /**
    * Cancel event that was sent, if any.
    * @param {string} conversation_id
    * @param {MessageEvent} event
    * @returns {Promise<void>}
    */
    cancel_event(conversation_id, event) {
        const ptr0 = passStringToWasm0(conversation_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.raygunbox_cancel_event(this.__wbg_ptr, ptr0, len0, event);
        return takeObject(ret);
    }
}

const RelationshipFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_relationship_free(ptr >>> 0, 1));
/**
*/
export class Relationship {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Relationship.prototype);
        obj.__wbg_ptr = ptr;
        RelationshipFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RelationshipFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_relationship_free(ptr, 0);
    }
    /**
    * @returns {boolean}
    */
    friends() {
        const ret = wasm.relationship_friends(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
    * @returns {boolean}
    */
    received_friend_request() {
        const ret = wasm.relationship_received_friend_request(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
    * @returns {boolean}
    */
    sent_friend_request() {
        const ret = wasm.relationship_sent_friend_request(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
    * @returns {boolean}
    */
    blocked() {
        const ret = wasm.relationship_blocked(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
    * @returns {boolean}
    */
    blocked_by() {
        const ret = wasm.relationship_blocked_by(this.__wbg_ptr);
        return ret !== 0;
    }
}

const TesseractFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_tesseract_free(ptr >>> 0, 1));
/**
*/
export class Tesseract {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Tesseract.prototype);
        obj.__wbg_ptr = ptr;
        TesseractFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        TesseractFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_tesseract_free(ptr, 0);
    }
    /**
    */
    constructor() {
        const ret = wasm.tesseract_new();
        this.__wbg_ptr = ret >>> 0;
        TesseractFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
    */
    set_autosave() {
        wasm.tesseract_set_autosave(this.__wbg_ptr);
    }
    /**
    * @returns {boolean}
    */
    autosave_enabled() {
        const ret = wasm.tesseract_autosave_enabled(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
    */
    disable_key_check() {
        wasm.tesseract_disable_key_check(this.__wbg_ptr);
    }
    /**
    */
    enable_key_check() {
        wasm.tesseract_enable_key_check(this.__wbg_ptr);
    }
    /**
    * @returns {boolean}
    */
    is_key_check_enabled() {
        const ret = wasm.tesseract_is_key_check_enabled(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
    * @param {string} key
    * @returns {boolean}
    */
    exist(key) {
        const ptr0 = passStringToWasm0(key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.tesseract_exist(this.__wbg_ptr, ptr0, len0);
        return ret !== 0;
    }
    /**
    */
    clear() {
        wasm.tesseract_clear(this.__wbg_ptr);
    }
    /**
    * @returns {boolean}
    */
    is_unlock() {
        const ret = wasm.tesseract_is_unlock(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
    */
    lock() {
        wasm.tesseract_lock(this.__wbg_ptr);
    }
    /**
    * @param {string} key
    * @param {string} value
    */
    set(key, value) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            wasm.tesseract_set(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} key
    * @returns {string}
    */
    retrieve(key) {
        let deferred3_0;
        let deferred3_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.tesseract_retrieve(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            var ptr2 = r0;
            var len2 = r1;
            if (r3) {
                ptr2 = 0; len2 = 0;
                throw takeObject(r2);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
    * @param {Uint8Array} old_passphrase
    * @param {Uint8Array} new_passphrase
    */
    update_unlock(old_passphrase, new_passphrase) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(old_passphrase, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(new_passphrase, wasm.__wbindgen_malloc);
            const len1 = WASM_VECTOR_LEN;
            wasm.tesseract_update_unlock(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} key
    */
    delete(key) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.tesseract_delete(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} passphrase
    */
    unlock(passphrase) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(passphrase, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.tesseract_unlock(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    */
    save() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.tesseract_save(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {AsyncIterator}
    */
    subscribe() {
        const ret = wasm.tesseract_subscribe(this.__wbg_ptr);
        return AsyncIterator.__wrap(ret);
    }
    /**
    */
    load_from_storage() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.tesseract_load_from_storage(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const WarpInstanceFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_warpinstance_free(ptr >>> 0, 1));
/**
*/
export class WarpInstance {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WarpInstance.prototype);
        obj.__wbg_ptr = ptr;
        WarpInstanceFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WarpInstanceFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_warpinstance_free(ptr, 0);
    }
    /**
    * @returns {MultiPassBox}
    */
    get multipass() {
        const ret = wasm.warpinstance_multipass(this.__wbg_ptr);
        return MultiPassBox.__wrap(ret);
    }
    /**
    * @returns {RayGunBox}
    */
    get raygun() {
        const ret = wasm.warpinstance_raygun(this.__wbg_ptr);
        return RayGunBox.__wrap(ret);
    }
    /**
    * @returns {ConstellationBox}
    */
    get constellation() {
        const ret = wasm.warpinstance_constellation(this.__wbg_ptr);
        return ConstellationBox.__wrap(ret);
    }
}

const WarpIpfsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_warpipfs_free(ptr >>> 0, 1));
/**
*/
export class WarpIpfs {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WarpIpfsFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_warpipfs_free(ptr, 0);
    }
    /**
    * @param {Config} config
    * @param {Tesseract | undefined} [tesseract]
    */
    constructor(config, tesseract) {
        _assertClass(config, Config);
        var ptr0 = config.__destroy_into_raw();
        let ptr1 = 0;
        if (!isLikeNone(tesseract)) {
            _assertClass(tesseract, Tesseract);
            ptr1 = tesseract.__destroy_into_raw();
        }
        const ret = wasm.warpipfs_new(ptr0, ptr1);
        return takeObject(ret);
    }
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbindgen_number_new = function(arg0) {
        const ret = arg0;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_attachmentresult_new = function(arg0) {
        const ret = AttachmentResult.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_asynciterator_new = function(arg0) {
        const ret = AsyncIterator.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_message_new = function(arg0) {
        const ret = Message.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_conversation_new = function(arg0) {
        const ret = Conversation.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_identityimage_new = function(arg0) {
        const ret = IdentityImage.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_conversationlist_new = function(arg0) {
        const ret = ConversationList.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_messages_new = function(arg0) {
        const ret = Messages.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_identityprofile_new = function(arg0) {
        const ret = IdentityProfile.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_relationship_new = function(arg0) {
        const ret = Relationship.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_identity_new = function(arg0) {
        const ret = Identity.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_messagereference_new = function(arg0) {
        const ret = MessageReference.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_warpinstance_new = function(arg0) {
        const ret = WarpInstance.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_error_new = function(arg0, arg1) {
        const ret = new Error(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_promiseresult_new = function(arg0) {
        const ret = PromiseResult.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        const ret = typeof(obj) === 'string' ? obj : undefined;
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbindgen_boolean_get = function(arg0) {
        const v = getObject(arg0);
        const ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
        return ret;
    };
    imports.wbg.__wbg_item_new = function(arg0) {
        const ret = Item.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_multipasseventkind_new = function(arg0) {
        const ret = MultiPassEventKind.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_number_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        const ret = typeof(obj) === 'number' ? obj : undefined;
        getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
    };
    imports.wbg.__wbg_item_unwrap = function(arg0) {
        const ret = Item.__unwrap(takeObject(arg0));
        return ret;
    };
    imports.wbg.__wbg_attachmentfile_unwrap = function(arg0) {
        const ret = AttachmentFile.__unwrap(takeObject(arg0));
        return ret;
    };
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        const ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_cb_drop = function(arg0) {
        const obj = takeObject(arg0).original;
        if (obj.cnt-- == 1) {
            obj.a = 0;
            return true;
        }
        const ret = false;
        return ret;
    };
    imports.wbg.__wbindgen_is_string = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'string';
        return ret;
    };
    imports.wbg.__wbindgen_is_bigint = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'bigint';
        return ret;
    };
    imports.wbg.__wbindgen_is_object = function(arg0) {
        const val = getObject(arg0);
        const ret = typeof(val) === 'object' && val !== null;
        return ret;
    };
    imports.wbg.__wbindgen_in = function(arg0, arg1) {
        const ret = getObject(arg0) in getObject(arg1);
        return ret;
    };
    imports.wbg.__wbindgen_bigint_from_i64 = function(arg0) {
        const ret = arg0;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_jsval_eq = function(arg0, arg1) {
        const ret = getObject(arg0) === getObject(arg1);
        return ret;
    };
    imports.wbg.__wbindgen_bigint_from_u64 = function(arg0) {
        const ret = BigInt.asUintN(64, arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
        const ret = getObject(arg0) === undefined;
        return ret;
    };
    imports.wbg.__wbindgen_is_null = function(arg0) {
        const ret = getObject(arg0) === null;
        return ret;
    };
    imports.wbg.__wbindgen_jsval_loose_eq = function(arg0, arg1) {
        const ret = getObject(arg0) == getObject(arg1);
        return ret;
    };
    imports.wbg.__wbindgen_as_number = function(arg0) {
        const ret = +getObject(arg0);
        return ret;
    };
    imports.wbg.__wbg_String_b9412f8799faab3e = function(arg0, arg1) {
        const ret = String(getObject(arg1));
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_new_04cad1563199a96e = function() { return handleError(function (arg0, arg1) {
        const ret = new WebTransport(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_newwithoptions_62ad2035308133e3 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = new WebTransport(getStringFromWasm0(arg0, arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_incomingBidirectionalStreams_7243dfac171ad1b9 = function(arg0) {
        const ret = getObject(arg0).incomingBidirectionalStreams;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_createBidirectionalStream_adf1fc6a09bd0a79 = function(arg0) {
        const ret = getObject(arg0).createBidirectionalStream();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_instanceof_WebTransportBidirectionalStream_9ffa5a91bd56954e = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof WebTransportBidirectionalStream;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_close_55008374445aa8ab = function(arg0) {
        getObject(arg0).close();
    };
    imports.wbg.__wbg_ready_0244064099b74641 = function(arg0) {
        const ret = getObject(arg0).ready;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_readable_df3a0a9afc1b36da = function(arg0) {
        const ret = getObject(arg0).readable;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_writable_9f916c8303e9d4e4 = function(arg0) {
        const ret = getObject(arg0).writable;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_WorkerGlobalScope_159f97a09b1c2937 = function(arg0) {
        const ret = getObject(arg0).WorkerGlobalScope;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_performance_a1b8bde2ee512264 = function(arg0) {
        const ret = getObject(arg0).performance;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_now_abd80e969af37148 = function(arg0) {
        const ret = getObject(arg0).now();
        return ret;
    };
    imports.wbg.__wbg_mark_40e050a77cc39fea = function(arg0, arg1) {
        performance.mark(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbg_log_c9486ca5d8e2cbe8 = function(arg0, arg1) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg0;
            deferred0_1 = arg1;
            console.log(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_log_aba5996d9bde071f = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg0;
            deferred0_1 = arg1;
            console.log(getStringFromWasm0(arg0, arg1), getStringFromWasm0(arg2, arg3), getStringFromWasm0(arg4, arg5), getStringFromWasm0(arg6, arg7));
        } finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_measure_aa7a73f17813f708 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        let deferred0_0;
        let deferred0_1;
        let deferred1_0;
        let deferred1_1;
        try {
            deferred0_0 = arg0;
            deferred0_1 = arg1;
            deferred1_0 = arg2;
            deferred1_1 = arg3;
            performance.measure(getStringFromWasm0(arg0, arg1), getStringFromWasm0(arg2, arg3));
        } finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }, arguments) };
    imports.wbg.__wbg_new_abda76e883ba8a5f = function() {
        const ret = new Error();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_stack_658279fe44541cf6 = function(arg0, arg1) {
        const ret = getObject(arg1).stack;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_error_f851667af71bcfc6 = function(arg0, arg1) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg0;
            deferred0_1 = arg1;
            console.error(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_done_2ffa852272310e47 = function(arg0) {
        const ret = getObject(arg0).done;
        return ret;
    };
    imports.wbg.__wbg_value_9f6eeb1e2aab8d96 = function(arg0) {
        const ret = getObject(arg0).value;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getReader_ab94afcb5cb7689a = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).getReader();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getwithrefkey_15c62c2b8546208d = function(arg0, arg1) {
        const ret = getObject(arg0)[getObject(arg1)];
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_20cbc34131e76824 = function(arg0, arg1, arg2) {
        getObject(arg0)[takeObject(arg1)] = takeObject(arg2);
    };
    imports.wbg.__wbg_clearTimeout_76877dbc010e786d = function(arg0) {
        const ret = clearTimeout(takeObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_setTimeout_75cb9b6991a4031d = function() { return handleError(function (arg0, arg1) {
        const ret = setTimeout(getObject(arg0), arg1);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_queueMicrotask_48421b3cc9052b68 = function(arg0) {
        const ret = getObject(arg0).queueMicrotask;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_function = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'function';
        return ret;
    };
    imports.wbg.__wbg_queueMicrotask_12a30234db4045d3 = function(arg0) {
        queueMicrotask(getObject(arg0));
    };
    imports.wbg.__wbg_instanceof_Window_5012736c80a01584 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Window;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_localStorage_90db5cb66e840248 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).localStorage;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_performance_fa12dc8712926291 = function(arg0) {
        const ret = getObject(arg0).performance;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_clearInterval_df3409c32c572e85 = function(arg0, arg1) {
        getObject(arg0).clearInterval(arg1);
    };
    imports.wbg.__wbg_setInterval_d4a371ef4db258a7 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).setInterval(getObject(arg1), arg2, ...getObject(arg3));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_setTimeout_73b734ca971c19f4 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).setTimeout(getObject(arg1), arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_clearInterval_26e463ce3f550c4b = function(arg0, arg1) {
        getObject(arg0).clearInterval(arg1);
    };
    imports.wbg.__wbg_setInterval_1758524273ba5b22 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).setInterval(getObject(arg1), arg2, ...getObject(arg3));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_instanceof_IdbOpenDbRequest_c0d2e9c902441588 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof IDBOpenDBRequest;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_setonupgradeneeded_8f3f0ac5d7130a6f = function(arg0, arg1) {
        getObject(arg0).onupgradeneeded = getObject(arg1);
    };
    imports.wbg.__wbg_now_a69647afb1f66247 = function(arg0) {
        const ret = getObject(arg0).now();
        return ret;
    };
    imports.wbg.__wbg_instanceof_IdbRequest_44d99b46adafe829 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof IDBRequest;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_result_fd2dae625828961d = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).result;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_error_1221bc1f1d0b14d3 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).error;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_setonsuccess_962c293b6e38a5d5 = function(arg0, arg1) {
        getObject(arg0).onsuccess = getObject(arg1);
    };
    imports.wbg.__wbg_setonerror_bd61d0a61808ca40 = function(arg0, arg1) {
        getObject(arg0).onerror = getObject(arg1);
    };
    imports.wbg.__wbg_data_5c47a6985fefc490 = function(arg0) {
        const ret = getObject(arg0).data;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_readyState_7237e2b1adac03a6 = function(arg0) {
        const ret = getObject(arg0).readyState;
        return ret;
    };
    imports.wbg.__wbg_bufferedAmount_77ba515edae4df34 = function(arg0) {
        const ret = getObject(arg0).bufferedAmount;
        return ret;
    };
    imports.wbg.__wbg_setonopen_7e770c87269cae90 = function(arg0, arg1) {
        getObject(arg0).onopen = getObject(arg1);
    };
    imports.wbg.__wbg_setonerror_5ec4625df3060159 = function(arg0, arg1) {
        getObject(arg0).onerror = getObject(arg1);
    };
    imports.wbg.__wbg_setonclose_40f935717ad6ffcd = function(arg0, arg1) {
        getObject(arg0).onclose = getObject(arg1);
    };
    imports.wbg.__wbg_setonmessage_b670c12ea34acd8b = function(arg0, arg1) {
        getObject(arg0).onmessage = getObject(arg1);
    };
    imports.wbg.__wbg_setbinaryType_d164a0be4c212c9c = function(arg0, arg1) {
        getObject(arg0).binaryType = ["blob","arraybuffer",][arg1];
    };
    imports.wbg.__wbg_new_0bf4a5b0632517ed = function() { return handleError(function (arg0, arg1) {
        const ret = new WebSocket(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_close_0a0cd79519b11318 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        getObject(arg0).close(arg1, getStringFromWasm0(arg2, arg3));
    }, arguments) };
    imports.wbg.__wbg_send_1b333b26681a902d = function() { return handleError(function (arg0, arg1, arg2) {
        getObject(arg0).send(getArrayU8FromWasm0(arg1, arg2));
    }, arguments) };
    imports.wbg.__wbg_target_b7cb1739bee70928 = function(arg0) {
        const ret = getObject(arg0).target;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_byobRequest_b32c77640da946ac = function(arg0) {
        const ret = getObject(arg0).byobRequest;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_close_aca7442e6619206b = function() { return handleError(function (arg0) {
        getObject(arg0).close();
    }, arguments) };
    imports.wbg.__wbg_instanceof_IdbFactory_9c1359c26643add1 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof IDBFactory;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_open_a89af1720976a433 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).open(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_open_e8f45f3526088828 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).open(getStringFromWasm0(arg1, arg2), arg3 >>> 0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_length_17e41c43021d9584 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).length;
        return ret;
    }, arguments) };
    imports.wbg.__wbg_getItem_cab39762abab3e70 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = getObject(arg1).getItem(getStringFromWasm0(arg2, arg3));
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    }, arguments) };
    imports.wbg.__wbg_key_89eef9cf026e74da = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg1).key(arg2 >>> 0);
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    }, arguments) };
    imports.wbg.__wbg_removeItem_f10a84254de33054 = function() { return handleError(function (arg0, arg1, arg2) {
        getObject(arg0).removeItem(getStringFromWasm0(arg1, arg2));
    }, arguments) };
    imports.wbg.__wbg_setItem_9482185c870abba6 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).setItem(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_delete_34764ece57bdc720 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).delete(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_get_88b5e79e9daccb9f = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).get(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getAll_754dfd3c399e3aa2 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).getAll();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getAll_cf97564e37784cbe = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).getAll(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getAll_a97ae2dbaa2373f9 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).getAll(getObject(arg1), arg2 >>> 0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getAllKeys_404d5487a041555d = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).getAllKeys();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getAllKeys_0496b6bb8aa48052 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).getAllKeys(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getAllKeys_f676e7c1f7048fee = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).getAllKeys(getObject(arg1), arg2 >>> 0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_put_b697dfdbcfb0598f = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).put(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_put_f83d95662936dee7 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).put(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_closed_308162adc3f122f3 = function(arg0) {
        const ret = getObject(arg0).closed;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_desiredSize_82fd81d4149bca9a = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg1).desiredSize;
        getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
    }, arguments) };
    imports.wbg.__wbg_ready_466364612ddb7cc4 = function(arg0) {
        const ret = getObject(arg0).ready;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_close_b4499ff2e2550f21 = function(arg0) {
        const ret = getObject(arg0).close();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_write_8c6e3bf306db71f2 = function(arg0, arg1) {
        const ret = getObject(arg0).write(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_view_2a901bda0727aeb3 = function(arg0) {
        const ret = getObject(arg0).view;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_respond_a799bab31a44f2d7 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).respond(arg1 >>> 0);
    }, arguments) };
    imports.wbg.__wbg_getReader_1997658275516cc3 = function(arg0) {
        const ret = getObject(arg0).getReader();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_close_cef2400b120c9c73 = function() { return handleError(function (arg0) {
        getObject(arg0).close();
    }, arguments) };
    imports.wbg.__wbg_enqueue_6f3d433b5e457aea = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).enqueue(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_instanceof_IdbDatabase_2c9f91b2db322a72 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof IDBDatabase;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_createObjectStore_cfb780710dbc3ad2 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).createObjectStore(getStringFromWasm0(arg1, arg2), getObject(arg3));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_transaction_66168ca19ab39a78 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).transaction(getObject(arg1), ["readonly","readwrite","versionchange","readwriteflush","cleanup",][arg2]);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_instanceof_IdbTransaction_d3f561bdf80cbd35 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof IDBTransaction;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_error_5c7bb46bfc30aee8 = function(arg0) {
        const ret = getObject(arg0).error;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_setonabort_aedc77f0151af20c = function(arg0, arg1) {
        getObject(arg0).onabort = getObject(arg1);
    };
    imports.wbg.__wbg_setoncomplete_a9e0ec1d6568a6d9 = function(arg0, arg1) {
        getObject(arg0).oncomplete = getObject(arg1);
    };
    imports.wbg.__wbg_setonerror_00500154a07e987d = function(arg0, arg1) {
        getObject(arg0).onerror = getObject(arg1);
    };
    imports.wbg.__wbg_commit_d40764961dd886fa = function() { return handleError(function (arg0) {
        getObject(arg0).commit();
    }, arguments) };
    imports.wbg.__wbg_objectStore_80724f9f6d33ab5b = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).objectStore(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_instanceof_ReadableStreamDefaultReader_742c2b00918b6df9 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof ReadableStreamDefaultReader;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_read_e48a676fb81ea800 = function(arg0) {
        const ret = getObject(arg0).read();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_releaseLock_1d2d93e9dc8d76e2 = function(arg0) {
        getObject(arg0).releaseLock();
    };
    imports.wbg.__wbg_cancel_97a2795574a4f522 = function(arg0) {
        const ret = getObject(arg0).cancel();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getWriter_300edebcd3c2c126 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).getWriter();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_crypto_566d7465cdbb6b7a = function(arg0) {
        const ret = getObject(arg0).crypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_process_dc09a8c7d59982f6 = function(arg0) {
        const ret = getObject(arg0).process;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_versions_d98c6400c6ca2bd8 = function(arg0) {
        const ret = getObject(arg0).versions;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_node_caaf83d002149bd5 = function(arg0) {
        const ret = getObject(arg0).node;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_require_94a9da52636aacbf = function() { return handleError(function () {
        const ret = module.require;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_msCrypto_0b84745e9245cdf6 = function(arg0) {
        const ret = getObject(arg0).msCrypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_randomFillSync_290977693942bf03 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).randomFillSync(takeObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_getRandomValues_260cc23a41afad9a = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).getRandomValues(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_get_3baa728f9d58d3f6 = function(arg0, arg1) {
        const ret = getObject(arg0)[arg1 >>> 0];
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_length_ae22078168b726f5 = function(arg0) {
        const ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_new_a220cf903aa02ca2 = function() {
        const ret = new Array();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newnoargs_76313bd6ff35d0f2 = function(arg0, arg1) {
        const ret = new Function(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_8608a2b51a5f6737 = function() {
        const ret = new Map();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_next_de3e9db4440638b2 = function(arg0) {
        const ret = getObject(arg0).next;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_next_f9cb570345655b9a = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).next();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_done_bfda7aa8f252b39f = function(arg0) {
        const ret = getObject(arg0).done;
        return ret;
    };
    imports.wbg.__wbg_value_6d39332ab4788d86 = function(arg0) {
        const ret = getObject(arg0).value;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_iterator_888179a48810a9fe = function() {
        const ret = Symbol.iterator;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_get_224d16597dbbfd96 = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.get(getObject(arg0), getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_call_1084a111329e68ce = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).call(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new_525245e2b9901204 = function() {
        const ret = new Object();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_self_3093d5d1f7bcb682 = function() { return handleError(function () {
        const ret = self.self;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_window_3bcfc4d31bc012f8 = function() { return handleError(function () {
        const ret = window.window;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_globalThis_86b222e13bdf32ed = function() { return handleError(function () {
        const ret = globalThis.globalThis;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_global_e5a3fe56f8be9485 = function() { return handleError(function () {
        const ret = global.global;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_set_673dda6c73d19609 = function(arg0, arg1, arg2) {
        getObject(arg0)[arg1 >>> 0] = takeObject(arg2);
    };
    imports.wbg.__wbg_isArray_8364a5371e9737d8 = function(arg0) {
        const ret = Array.isArray(getObject(arg0));
        return ret;
    };
    imports.wbg.__wbg_push_37c89022f34c01ca = function(arg0, arg1) {
        const ret = getObject(arg0).push(getObject(arg1));
        return ret;
    };
    imports.wbg.__wbg_instanceof_ArrayBuffer_61dfc3198373c902 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof ArrayBuffer;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Error_69bde193b0cc95e3 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Error;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_new_796382978dfd4fb0 = function(arg0, arg1) {
        const ret = new Error(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_message_e18bae0a0e2c097a = function(arg0) {
        const ret = getObject(arg0).message;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_name_ac78212e803c7941 = function(arg0) {
        const ret = getObject(arg0).name;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_toString_9d18e102ca933e68 = function(arg0) {
        const ret = getObject(arg0).toString();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_call_89af060b4e1523f2 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_forEach_7a5ec5c2efb50a6d = function(arg0, arg1, arg2) {
        try {
            var state0 = {a: arg1, b: arg2};
            var cb0 = (arg0, arg1) => {
                const a = state0.a;
                state0.a = 0;
                try {
                    return __wbg_adapter_659(a, state0.b, arg0, arg1);
                } finally {
                    state0.a = a;
                }
            };
            getObject(arg0).forEach(cb0);
        } finally {
            state0.a = state0.b = 0;
        }
    };
    imports.wbg.__wbg_set_49185437f0ab06f8 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).set(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_isSafeInteger_7f1ed56200d90674 = function(arg0) {
        const ret = Number.isSafeInteger(getObject(arg0));
        return ret;
    };
    imports.wbg.__wbg_getTime_91058879093a1589 = function(arg0) {
        const ret = getObject(arg0).getTime();
        return ret;
    };
    imports.wbg.__wbg_new_7982fb43cfca37ae = function(arg0) {
        const ret = new Date(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new0_65387337a95cf44d = function() {
        const ret = new Date();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_now_b7a162010a9e75b4 = function() {
        const ret = Date.now();
        return ret;
    };
    imports.wbg.__wbg_entries_7a0e06255456ebcd = function(arg0) {
        const ret = Object.entries(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_toString_e17a6671146f47c1 = function(arg0) {
        const ret = getObject(arg0).toString();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_b85e72ed1bfd57f9 = function(arg0, arg1) {
        try {
            var state0 = {a: arg0, b: arg1};
            var cb0 = (arg0, arg1) => {
                const a = state0.a;
                state0.a = 0;
                try {
                    return __wbg_adapter_659(a, state0.b, arg0, arg1);
                } finally {
                    state0.a = a;
                }
            };
            const ret = new Promise(cb0);
            return addHeapObject(ret);
        } finally {
            state0.a = state0.b = 0;
        }
    };
    imports.wbg.__wbg_resolve_570458cb99d56a43 = function(arg0) {
        const ret = Promise.resolve(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_catch_a279b1da46d132d8 = function(arg0, arg1) {
        const ret = getObject(arg0).catch(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_then_95e6edc0f89b73b1 = function(arg0, arg1) {
        const ret = getObject(arg0).then(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_then_876bb3c633745cc6 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_buffer_b7b08af79b0b0974 = function(arg0) {
        const ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_8a2cb9ca96b27ec9 = function(arg0, arg1, arg2) {
        const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_ea1883e1e5e86686 = function(arg0) {
        const ret = new Uint8Array(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_d1e79e2388520f18 = function(arg0, arg1, arg2) {
        getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    };
    imports.wbg.__wbg_length_8339fcf5d8ecd12e = function(arg0) {
        const ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Uint8Array_247a91427532499e = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Uint8Array;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_newwithlength_ec548f448387c968 = function(arg0) {
        const ret = new Uint8Array(arg0 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_buffer_0710d1b9dbe2eea6 = function(arg0) {
        const ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_subarray_7c2e3576afe181d1 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_slice_b698b331b2ab7d72 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).slice(arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_byteLength_850664ef28f3e42f = function(arg0) {
        const ret = getObject(arg0).byteLength;
        return ret;
    };
    imports.wbg.__wbg_byteOffset_ea14c35fa6de38cc = function(arg0) {
        const ret = getObject(arg0).byteOffset;
        return ret;
    };
    imports.wbg.__wbg_set_eacc7d73fefaafdf = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
        return ret;
    }, arguments) };
    imports.wbg.__wbindgen_bigint_get_as_i64 = function(arg0, arg1) {
        const v = getObject(arg1);
        const ret = typeof(v) === 'bigint' ? v : undefined;
        getDataViewMemory0().setBigInt64(arg0 + 8 * 1, isLikeNone(ret) ? BigInt(0) : ret, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
    };
    imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
        const ret = debugString(getObject(arg1));
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_memory = function() {
        const ret = wasm.memory;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper17243 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 4787, __wbg_adapter_52);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper19140 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 5823, __wbg_adapter_55);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper19272 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 5876, __wbg_adapter_58);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper19691 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 6038, __wbg_adapter_61);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper19844 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 6111, __wbg_adapter_64);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper19845 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 6111, __wbg_adapter_64);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper19846 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 6111, __wbg_adapter_64);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper23805 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 7678, __wbg_adapter_71);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper24398 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 7842, __wbg_adapter_74);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper24419 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 7853, __wbg_adapter_77);
        return addHeapObject(ret);
    };

    return imports;
}

function __wbg_init_memory(imports, memory) {

}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedDataViewMemory0 = null;
    cachedUint8ArrayMemory0 = null;


    wasm.__wbindgen_start();
    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (typeof module !== 'undefined' && Object.getPrototypeOf(module) === Object.prototype)
    ({module} = module)
    else
    console.warn('using deprecated parameters for `initSync()`; pass a single object instead')

    const imports = __wbg_get_imports();

    __wbg_init_memory(imports);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (typeof module_or_path !== 'undefined' && Object.getPrototypeOf(module_or_path) === Object.prototype)
    ({module_or_path} = module_or_path)
    else
    console.warn('using deprecated parameters for the initialization function; pass a single object instead')

    if (typeof module_or_path === 'undefined') {
        module_or_path = new URL('warp_ipfs_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    __wbg_init_memory(imports);

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync };
export default __wbg_init;
