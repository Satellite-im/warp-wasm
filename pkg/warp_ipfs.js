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

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
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
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8Memory0();

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
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
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

let cachedInt32Memory0 = null;

function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}

let cachedFloat64Memory0 = null;

function getFloat64Memory0() {
    if (cachedFloat64Memory0 === null || cachedFloat64Memory0.byteLength === 0) {
        cachedFloat64Memory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64Memory0;
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
function __wbg_adapter_40(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h78f2fdaca8477660(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_43(arg0, arg1) {
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h675c1f5f34bba5e6(arg0, arg1);
}

function __wbg_adapter_46(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hbbc5da02b2e63199(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_49(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h50a00e247fe2e442(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_56(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h10e8b410c01b787f(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_63(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h354fac41522cfa0b(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_66(arg0, arg1) {
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hd6c7af03884f20fc(arg0, arg1);
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8Memory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}
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
export function generate_name() {
    let deferred1_0;
    let deferred1_1;
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.generate_name(retptr);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        deferred1_0 = r0;
        deferred1_1 = r1;
        return getStringFromWasm0(r0, r1);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}
function __wbg_adapter_398(arg0, arg1, arg2, arg3) {
    wasm.wasm_bindgen__convert__closures__invoke2_mut__hc57b695ec7a8fdc9(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}

/**
*/
export const MultiPassEventKindEnum = Object.freeze({ FriendRequestReceived:0,"0":"FriendRequestReceived",FriendRequestSent:1,"1":"FriendRequestSent",IncomingFriendRequestRejected:2,"2":"IncomingFriendRequestRejected",OutgoingFriendRequestRejected:3,"3":"OutgoingFriendRequestRejected",IncomingFriendRequestClosed:4,"4":"IncomingFriendRequestClosed",OutgoingFriendRequestClosed:5,"5":"OutgoingFriendRequestClosed",FriendAdded:6,"6":"FriendAdded",FriendRemoved:7,"7":"FriendRemoved",IdentityOnline:8,"8":"IdentityOnline",IdentityOffline:9,"9":"IdentityOffline",IdentityUpdate:10,"10":"IdentityUpdate",Blocked:11,"11":"Blocked",BlockedBy:12,"12":"BlockedBy",Unblocked:13,"13":"Unblocked",UnblockedBy:14,"14":"UnblockedBy", });
/**
*/
export const IdentityUpdate = Object.freeze({ Username:0,"0":"Username",Picture:1,"1":"Picture",PicturePath:2,"2":"PicturePath",PictureStream:3,"3":"PictureStream",ClearPicture:4,"4":"ClearPicture",Banner:5,"5":"Banner",BannerPath:6,"6":"BannerPath",BannerStream:7,"7":"BannerStream",ClearBanner:8,"8":"ClearBanner",StatusMessage:9,"9":"StatusMessage",ClearStatusMessage:10,"10":"ClearStatusMessage", });
/**
*/
export const Identifier = Object.freeze({ DID:0,"0":"DID",DIDList:1,"1":"DIDList",Username:2,"2":"Username",Own:3,"3":"Own", });
/**
*/
export const TesseractEvent = Object.freeze({ Unlocked:0,"0":"Unlocked",Locked:1,"1":"Locked", });

const AsyncIteratorFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_asynciterator_free(ptr >>> 0));
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
        wasm.__wbg_asynciterator_free(ptr);
    }
    /**
    * @returns {Promise<Promise<any>>}
    */
    next() {
        const ret = wasm.asynciterator_next(this.__wbg_ptr);
        return takeObject(ret);
    }
}

const ConfigFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_config_free(ptr >>> 0));
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
        wasm.__wbg_config_free(ptr);
    }
    /**
    * Default configuration for local development and writing test
    * @returns {Config}
    */
    static development() {
        const ret = wasm.config_development();
        return Config.__wrap(ret);
    }
    /**
    * Test configuration. Used for in-memory
    * @returns {Config}
    */
    static testing() {
        const ret = wasm.config_testing();
        return Config.__wrap(ret);
    }
    /**
    * Minimal testing configuration. Used for in-memory
    * @returns {Config}
    */
    static minimal_testing() {
        const ret = wasm.config_minimal_testing();
        return Config.__wrap(ret);
    }
}

const ConstellationBoxFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_constellationbox_free(ptr >>> 0));
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
        wasm.__wbg_constellationbox_free(ptr);
    }
}

const IdentityFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_identity_free(ptr >>> 0));
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
        wasm.__wbg_identity_free(ptr);
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
    * @returns {string}
    */
    username() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.identity_username(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
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
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
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
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
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
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
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
}

const IdentityProfileFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_identityprofile_free(ptr >>> 0));
/**
* Profile containing the newly created `Identity` and a passphrase, if applicable.
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
        wasm.__wbg_identityprofile_free(ptr);
    }
    /**
    * @param {Identity} identity
    * @param {string | undefined} [passphrase]
    * @returns {IdentityProfile}
    */
    static new(identity, passphrase) {
        _assertClass(identity, Identity);
        var ptr0 = identity.__destroy_into_raw();
        var ptr1 = isLikeNone(passphrase) ? 0 : passStringToWasm0(passphrase, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        const ret = wasm.identityprofile_new(ptr0, ptr1, len1);
        return IdentityProfile.__wrap(ret);
    }
    /**
    * @returns {Identity}
    */
    identity() {
        const ret = wasm.identityprofile_identity(this.__wbg_ptr);
        return Identity.__wrap(ret);
    }
    /**
    * @param {Identity} identity
    */
    set_identity(identity) {
        _assertClass(identity, Identity);
        var ptr0 = identity.__destroy_into_raw();
        wasm.identityprofile_set_identity(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {string | undefined}
    */
    passphrase() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.identityprofile_passphrase(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
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

const MultiPassBoxFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_multipassbox_free(ptr >>> 0));
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
        wasm.__wbg_multipassbox_free(ptr);
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
    get_own_identity() {
        const ret = wasm.multipassbox_get_own_identity(this.__wbg_ptr);
        return takeObject(ret);
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
}

const MultiPassEventKindFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_multipasseventkind_free(ptr >>> 0));
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
        wasm.__wbg_multipasseventkind_free(ptr);
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
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
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
    : new FinalizationRegistry(ptr => wasm.__wbg_promiseresult_free(ptr >>> 0));
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
        wasm.__wbg_promiseresult_free(ptr);
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
    : new FinalizationRegistry(ptr => wasm.__wbg_raygunbox_free(ptr >>> 0));
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
        wasm.__wbg_raygunbox_free(ptr);
    }
}

const TesseractFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_tesseract_free(ptr >>> 0));
/**
* The key store that holds encrypted strings that can be used for later use.
*/
export class Tesseract {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        TesseractFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_tesseract_free(ptr);
    }
    /**
    * To create an instance of Tesseract
    */
    constructor() {
        const ret = wasm.tesseract_new();
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
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
    set_autosave() {
        wasm.tesseract_set_autosave(this.__wbg_ptr);
    }
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
    autosave_enabled() {
        const ret = wasm.tesseract_autosave_enabled(this.__wbg_ptr);
        return ret !== 0;
    }
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
    disable_key_check() {
        wasm.tesseract_disable_key_check(this.__wbg_ptr);
    }
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
    enable_key_check() {
        wasm.tesseract_enable_key_check(this.__wbg_ptr);
    }
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
    is_key_check_enabled() {
        const ret = wasm.tesseract_is_key_check_enabled(this.__wbg_ptr);
        return ret !== 0;
    }
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
    exist(key) {
        const ptr0 = passStringToWasm0(key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.tesseract_exist(this.__wbg_ptr, ptr0, len0);
        return ret !== 0;
    }
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
    clear() {
        wasm.tesseract_clear(this.__wbg_ptr);
    }
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
    is_unlock() {
        const ret = wasm.tesseract_is_unlock(this.__wbg_ptr);
        return ret !== 0;
    }
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
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
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
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            var r3 = getInt32Memory0()[retptr / 4 + 3];
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
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
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
    _delete(key) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.tesseract__delete(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
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
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
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
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
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
    * Used to load contents from local storage
    */
    load_from_storage() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.tesseract_load_from_storage(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
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
    : new FinalizationRegistry(ptr => wasm.__wbg_warpinstance_free(ptr >>> 0));
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
        wasm.__wbg_warpinstance_free(ptr);
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
    : new FinalizationRegistry(ptr => wasm.__wbg_warpipfs_free(ptr >>> 0));
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
        wasm.__wbg_warpipfs_free(ptr);
    }
    /**
    * @param {Config} config
    * @param {Tesseract} tesseract
    */
    constructor(config, tesseract) {
        _assertClass(config, Config);
        var ptr0 = config.__destroy_into_raw();
        _assertClass(tesseract, Tesseract);
        var ptr1 = tesseract.__destroy_into_raw();
        const ret = wasm.warpipfs_new_wasm(ptr0, ptr1);
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
    imports.wbg.__wbindgen_cb_drop = function(arg0) {
        const obj = takeObject(arg0).original;
        if (obj.cnt-- == 1) {
            obj.a = 0;
            return true;
        }
        const ret = false;
        return ret;
    };
    imports.wbg.__wbg_identityprofile_new = function(arg0) {
        const ret = IdentityProfile.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_number_new = function(arg0) {
        const ret = arg0;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_asynciterator_new = function(arg0) {
        const ret = AsyncIterator.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_multipasseventkind_new = function(arg0) {
        const ret = MultiPassEventKind.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_promiseresult_new = function(arg0) {
        const ret = PromiseResult.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_warpinstance_new = function(arg0) {
        const ret = WarpInstance.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_identity_new = function(arg0) {
        const ret = Identity.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_error_new = function(arg0, arg1) {
        const ret = new Error(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        const ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        const ret = typeof(obj) === 'string' ? obj : undefined;
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbindgen_is_null = function(arg0) {
        const ret = getObject(arg0) === null;
        return ret;
    };
    imports.wbg.__wbindgen_number_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        const ret = typeof(obj) === 'number' ? obj : undefined;
        getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
        getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
    };
    imports.wbg.__wbindgen_is_object = function(arg0) {
        const val = getObject(arg0);
        const ret = typeof(val) === 'object' && val !== null;
        return ret;
    };
    imports.wbg.__wbindgen_jsval_loose_eq = function(arg0, arg1) {
        const ret = getObject(arg0) == getObject(arg1);
        return ret;
    };
    imports.wbg.__wbindgen_boolean_get = function(arg0) {
        const v = getObject(arg0);
        const ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
        return ret;
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_20cbc34131e76824 = function(arg0, arg1, arg2) {
        getObject(arg0)[takeObject(arg1)] = takeObject(arg2);
    };
    imports.wbg.__wbindgen_as_number = function(arg0) {
        const ret = +getObject(arg0);
        return ret;
    };
    imports.wbg.__wbg_String_b9412f8799faab3e = function(arg0, arg1) {
        const ret = String(getObject(arg1));
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbindgen_is_string = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'string';
        return ret;
    };
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
        const ret = getObject(arg0) === undefined;
        return ret;
    };
    imports.wbg.__wbg_WorkerGlobalScope_fd1ac71dd5521929 = function(arg0) {
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
    imports.wbg.__wbg_queueMicrotask_3cbae2ec6b6cd3d6 = function(arg0) {
        const ret = getObject(arg0).queueMicrotask;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_function = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'function';
        return ret;
    };
    imports.wbg.__wbg_queueMicrotask_481971b0d87f3dd4 = function(arg0) {
        queueMicrotask(getObject(arg0));
    };
    imports.wbg.__wbg_clearTimeout_76877dbc010e786d = function(arg0) {
        const ret = clearTimeout(takeObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_setTimeout_75cb9b6991a4031d = function() { return handleError(function (arg0, arg1) {
        const ret = setTimeout(getObject(arg0), arg1);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_instanceof_Window_f401953a2cf86220 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Window;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_document_5100775d18896c16 = function(arg0) {
        const ret = getObject(arg0).document;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_navigator_6c8fa55c5cc8796e = function(arg0) {
        const ret = getObject(arg0).navigator;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_localStorage_e381d34d0c40c761 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).localStorage;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_performance_3298a9628a5c8aa4 = function(arg0) {
        const ret = getObject(arg0).performance;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_clearInterval_4368213fd2b325b0 = function(arg0, arg1) {
        getObject(arg0).clearInterval(arg1);
    };
    imports.wbg.__wbg_setInterval_fc26942d7c8fecb1 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).setInterval(getObject(arg1), arg2, ...getObject(arg3));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_setTimeout_c172d5704ef82276 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).setTimeout(getObject(arg1), arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_location_1325817a58c77ceb = function(arg0) {
        const ret = getObject(arg0).location;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_clearInterval_4e34ef4defa59ef6 = function(arg0, arg1) {
        getObject(arg0).clearInterval(arg1);
    };
    imports.wbg.__wbg_setInterval_411633bda2729111 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).setInterval(getObject(arg1), arg2, ...getObject(arg3));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_instanceof_IdbTransaction_e769fa98770b7597 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof IDBTransaction;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_error_968d41e74d6ecb20 = function(arg0) {
        const ret = getObject(arg0).error;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_setonabort_523135fd9168ae8b = function(arg0, arg1) {
        getObject(arg0).onabort = getObject(arg1);
    };
    imports.wbg.__wbg_setoncomplete_d8e4236665cbf1e2 = function(arg0, arg1) {
        getObject(arg0).oncomplete = getObject(arg1);
    };
    imports.wbg.__wbg_setonerror_da071ec94e148397 = function(arg0, arg1) {
        getObject(arg0).onerror = getObject(arg1);
    };
    imports.wbg.__wbg_commit_386dbf9bf88312d5 = function() { return handleError(function (arg0) {
        getObject(arg0).commit();
    }, arguments) };
    imports.wbg.__wbg_objectStore_da468793bd9df17b = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).objectStore(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_instanceof_IdbDatabase_db671cf2454a9542 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof IDBDatabase;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_createObjectStore_f494613cd1a00d43 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).createObjectStore(getStringFromWasm0(arg1, arg2), getObject(arg3));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_transaction_b39e2665b40b6324 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).transaction(getObject(arg1), takeObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_instanceof_IdbOpenDbRequest_3f4a166bc0340578 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof IDBOpenDBRequest;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_setonupgradeneeded_ad7645373c7d5e1b = function(arg0, arg1) {
        getObject(arg0).onupgradeneeded = getObject(arg1);
    };
    imports.wbg.__wbg_channel_034b1aa3ed21a9d2 = function(arg0) {
        const ret = getObject(arg0).channel;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_readyState_1c157e4ea17c134a = function(arg0) {
        const ret = getObject(arg0).readyState;
        return ret;
    };
    imports.wbg.__wbg_bufferedAmount_3c6681ad67905b7f = function(arg0) {
        const ret = getObject(arg0).bufferedAmount;
        return ret;
    };
    imports.wbg.__wbg_setonopen_ce7a4c51e5cf5788 = function(arg0, arg1) {
        getObject(arg0).onopen = getObject(arg1);
    };
    imports.wbg.__wbg_setonerror_39a785302b0cd2e9 = function(arg0, arg1) {
        getObject(arg0).onerror = getObject(arg1);
    };
    imports.wbg.__wbg_setonclose_b9929b1c1624dff3 = function(arg0, arg1) {
        getObject(arg0).onclose = getObject(arg1);
    };
    imports.wbg.__wbg_setonmessage_2af154ce83a3dc94 = function(arg0, arg1) {
        getObject(arg0).onmessage = getObject(arg1);
    };
    imports.wbg.__wbg_setbinaryType_b0cf5103cd561959 = function(arg0, arg1) {
        getObject(arg0).binaryType = takeObject(arg1);
    };
    imports.wbg.__wbg_new_6c74223c77cfabad = function() { return handleError(function (arg0, arg1) {
        const ret = new WebSocket(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_close_52033153a6a5ad44 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        getObject(arg0).close(arg1, getStringFromWasm0(arg2, arg3));
    }, arguments) };
    imports.wbg.__wbg_send_5fcd7bab9777194e = function() { return handleError(function (arg0, arg1, arg2) {
        getObject(arg0).send(getArrayU8FromWasm0(arg1, arg2));
    }, arguments) };
    imports.wbg.__wbg_instanceof_IdbFactory_c70f8c7294f93655 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof IDBFactory;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_open_f0d7259fd7e689ce = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).open(getStringFromWasm0(arg1, arg2), arg3 >>> 0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_open_a05198d687357536 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).open(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_localDescription_fdbb277fe69d4acc = function(arg0) {
        const ret = getObject(arg0).localDescription;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_setondatachannel_613916740487b8be = function(arg0, arg1) {
        getObject(arg0).ondatachannel = getObject(arg1);
    };
    imports.wbg.__wbg_newwithconfiguration_b15024f88c684163 = function() { return handleError(function (arg0) {
        const ret = new RTCPeerConnection(getObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_close_afa09a1e1e0a4628 = function(arg0) {
        getObject(arg0).close();
    };
    imports.wbg.__wbg_createDataChannel_df256842e04b7684 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).createDataChannel(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_createDataChannel_2cb2147b68f44846 = function(arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).createDataChannel(getStringFromWasm0(arg1, arg2), getObject(arg3));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_createOffer_663eb8b8f3c6f8b9 = function(arg0) {
        const ret = getObject(arg0).createOffer();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_generateCertificate_31ec6e1adc163ef8 = function() { return handleError(function (arg0) {
        const ret = RTCPeerConnection.generateCertificate(getObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_setLocalDescription_41e208bc9dc2a799 = function(arg0, arg1) {
        const ret = getObject(arg0).setLocalDescription(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_setRemoteDescription_38ba80261ed6604d = function(arg0, arg1) {
        const ret = getObject(arg0).setRemoteDescription(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_sdp_ec4467d15d4acf46 = function(arg0, arg1) {
        const ret = getObject(arg1).sdp;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_target_2fc177e386c8b7b0 = function(arg0) {
        const ret = getObject(arg0).target;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_userAgent_e94c7cbcdac01fea = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg1).userAgent;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    }, arguments) };
    imports.wbg.__wbg_length_c2eb1c77befa5ab2 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).length;
        return ret;
    }, arguments) };
    imports.wbg.__wbg_getItem_164e8e5265095b87 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = getObject(arg1).getItem(getStringFromWasm0(arg2, arg3));
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    }, arguments) };
    imports.wbg.__wbg_key_c98cb78ec00838d8 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg1).key(arg2 >>> 0);
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    }, arguments) };
    imports.wbg.__wbg_removeItem_c0321116dc514363 = function() { return handleError(function (arg0, arg1, arg2) {
        getObject(arg0).removeItem(getStringFromWasm0(arg1, arg2));
    }, arguments) };
    imports.wbg.__wbg_setItem_ba2bb41d73dac079 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).setItem(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_instanceof_IdbRequest_93249da04f5370b6 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof IDBRequest;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_result_6cedf5f78600a79c = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).result;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_error_685b20024dc2d6ca = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).error;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_setonsuccess_632ce0a1460455c2 = function(arg0, arg1) {
        getObject(arg0).onsuccess = getObject(arg1);
    };
    imports.wbg.__wbg_setonerror_8479b33e7568a904 = function(arg0, arg1) {
        getObject(arg0).onerror = getObject(arg1);
    };
    imports.wbg.__wbg_data_3ce7c145ca4fbcdc = function(arg0) {
        const ret = getObject(arg0).data;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_hostname_3d9f22c60dc5bec6 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg1).hostname;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    }, arguments) };
    imports.wbg.__wbg_readyState_4cec7804e10e9e8c = function(arg0) {
        const ret = getObject(arg0).readyState;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_bufferedAmount_d96d201d2e665ac8 = function(arg0) {
        const ret = getObject(arg0).bufferedAmount;
        return ret;
    };
    imports.wbg.__wbg_setbufferedAmountLowThreshold_c720cc0a1e84254f = function(arg0, arg1) {
        getObject(arg0).bufferedAmountLowThreshold = arg1 >>> 0;
    };
    imports.wbg.__wbg_setonopen_a8d36a7a7e2a0661 = function(arg0, arg1) {
        getObject(arg0).onopen = getObject(arg1);
    };
    imports.wbg.__wbg_setonclose_756793f4dc0ff009 = function(arg0, arg1) {
        getObject(arg0).onclose = getObject(arg1);
    };
    imports.wbg.__wbg_setonmessage_156079b6ed74472e = function(arg0, arg1) {
        getObject(arg0).onmessage = getObject(arg1);
    };
    imports.wbg.__wbg_setonbufferedamountlow_b8982bab0245abc8 = function(arg0, arg1) {
        getObject(arg0).onbufferedamountlow = getObject(arg1);
    };
    imports.wbg.__wbg_setbinaryType_0b2b32db03dea0c0 = function(arg0, arg1) {
        getObject(arg0).binaryType = takeObject(arg1);
    };
    imports.wbg.__wbg_send_a10ff3ed6e9aee30 = function() { return handleError(function (arg0, arg1, arg2) {
        getObject(arg0).send(getArrayU8FromWasm0(arg1, arg2));
    }, arguments) };
    imports.wbg.__wbg_delete_f60bba7d0ae59a4f = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).delete(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_get_5361b64cac0d0826 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).get(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getAll_2782e438df699384 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).getAll();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getAll_b0220bb36d03e1ca = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).getAll(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getAll_39833af18e3dd715 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).getAll(getObject(arg1), arg2 >>> 0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getAllKeys_efcb2539294e25ef = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).getAllKeys();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getAllKeys_c0728d617bc10df4 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).getAllKeys(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getAllKeys_3c9ece267d1a1e44 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).getAllKeys(getObject(arg1), arg2 >>> 0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_put_0a0d7ca0f7fa8f83 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).put(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_put_22792e17580ca18b = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).put(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_now_4e659b3d15f470d9 = function(arg0) {
        const ret = getObject(arg0).now();
        return ret;
    };
    imports.wbg.__wbg_crypto_1d1f22824a6a080c = function(arg0) {
        const ret = getObject(arg0).crypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_process_4a72847cc503995b = function(arg0) {
        const ret = getObject(arg0).process;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_versions_f686565e586dd935 = function(arg0) {
        const ret = getObject(arg0).versions;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_node_104a2ff8d6ea03a2 = function(arg0) {
        const ret = getObject(arg0).node;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_require_cca90b1a94a0255b = function() { return handleError(function () {
        const ret = module.require;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_msCrypto_eb05e62b530a1508 = function(arg0) {
        const ret = getObject(arg0).msCrypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_randomFillSync_5c9c955aa56b6049 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).randomFillSync(takeObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_getRandomValues_3aa56aa6edec874c = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).getRandomValues(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_get_bd8e338fbd5f5cc8 = function(arg0, arg1) {
        const ret = getObject(arg0)[arg1 >>> 0];
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_length_cd7af8117672b8b8 = function(arg0) {
        const ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_new_16b304a2cfa7ff4a = function() {
        const ret = new Array();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newnoargs_e258087cd0daa0ea = function(arg0, arg1) {
        const ret = new Function(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_next_40fc327bfc8770e6 = function(arg0) {
        const ret = getObject(arg0).next;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_next_196c84450b364254 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).next();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_done_298b57d23c0fc80c = function(arg0) {
        const ret = getObject(arg0).done;
        return ret;
    };
    imports.wbg.__wbg_value_d93c65011f51a456 = function(arg0) {
        const ret = getObject(arg0).value;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_iterator_2cee6dadfd956dfa = function() {
        const ret = Symbol.iterator;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_get_e3c254076557e348 = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.get(getObject(arg0), getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_call_27c0f87801dedf93 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).call(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new_72fb9a18b5ae2624 = function() {
        const ret = new Object();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_self_ce0dbfc45cf2f5be = function() { return handleError(function () {
        const ret = self.self;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_window_c6fb939a7f436783 = function() { return handleError(function () {
        const ret = window.window;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_globalThis_d1e6af4856ba331b = function() { return handleError(function () {
        const ret = globalThis.globalThis;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_global_207b558942527489 = function() { return handleError(function () {
        const ret = global.global;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_set_d4638f722068f043 = function(arg0, arg1, arg2) {
        getObject(arg0)[arg1 >>> 0] = takeObject(arg2);
    };
    imports.wbg.__wbg_isArray_2ab64d95e09ea0ae = function(arg0) {
        const ret = Array.isArray(getObject(arg0));
        return ret;
    };
    imports.wbg.__wbg_push_a5b05aedc7234f9f = function(arg0, arg1) {
        const ret = getObject(arg0).push(getObject(arg1));
        return ret;
    };
    imports.wbg.__wbg_instanceof_ArrayBuffer_836825be07d4c9d2 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof ArrayBuffer;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Error_e20bb56fd5591a93 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Error;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_message_5bf28016c2b49cfb = function(arg0) {
        const ret = getObject(arg0).message;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_name_e7429f0dda6079e2 = function(arg0) {
        const ret = getObject(arg0).name;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_toString_ffe4c9ea3b3532e9 = function(arg0) {
        const ret = getObject(arg0).toString();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_call_b3ca7c6051f9bec1 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_isSafeInteger_f7b04ef02296c4d2 = function(arg0) {
        const ret = Number.isSafeInteger(getObject(arg0));
        return ret;
    };
    imports.wbg.__wbg_getTime_2bc4375165f02d15 = function(arg0) {
        const ret = getObject(arg0).getTime();
        return ret;
    };
    imports.wbg.__wbg_new_cf3ec55744a78578 = function(arg0) {
        const ret = new Date(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new0_7d84e5b2cd9fdc73 = function() {
        const ret = new Date();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_now_3014639a94423537 = function() {
        const ret = Date.now();
        return ret;
    };
    imports.wbg.__wbg_toString_c816a20ab859d0c1 = function(arg0) {
        const ret = getObject(arg0).toString();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_81740750da40724f = function(arg0, arg1) {
        try {
            var state0 = {a: arg0, b: arg1};
            var cb0 = (arg0, arg1) => {
                const a = state0.a;
                state0.a = 0;
                try {
                    return __wbg_adapter_398(a, state0.b, arg0, arg1);
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
    imports.wbg.__wbg_resolve_b0083a7967828ec8 = function(arg0) {
        const ret = Promise.resolve(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_then_0c86a60e8fcfe9f6 = function(arg0, arg1) {
        const ret = getObject(arg0).then(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_then_a73caa9a87991566 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_buffer_12d079cc21e14bdb = function(arg0) {
        const ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_aa4a17c33a06e5cb = function(arg0, arg1, arg2) {
        const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_63b92bc8671ed464 = function(arg0) {
        const ret = new Uint8Array(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_a47bac70306a19a7 = function(arg0, arg1, arg2) {
        getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    };
    imports.wbg.__wbg_length_c20a40f15020d68a = function(arg0) {
        const ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Uint8Array_2b3bbecd033d19f6 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Uint8Array;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_newwithlength_e9b4878cebadb3d3 = function(arg0) {
        const ret = new Uint8Array(arg0 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_subarray_a1f73cd4b5b42fe1 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_1f9b04f170055d33 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
        return ret;
    }, arguments) };
    imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
        const ret = debugString(getObject(arg1));
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_memory = function() {
        const ret = wasm.memory;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper12655 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 3783, __wbg_adapter_40);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper15121 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 5109, __wbg_adapter_43);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper15246 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 5170, __wbg_adapter_46);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper15316 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 5193, __wbg_adapter_49);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper15317 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 5193, __wbg_adapter_49);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper15318 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 5193, __wbg_adapter_49);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper16241 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 5576, __wbg_adapter_56);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper16242 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 5576, __wbg_adapter_56);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper16243 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 5576, __wbg_adapter_56);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper19090 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 6758, __wbg_adapter_63);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper19302 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 6849, __wbg_adapter_66);
        return addHeapObject(ret);
    };

    return imports;
}

function __wbg_init_memory(imports, maybe_memory) {

}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedFloat64Memory0 = null;
    cachedInt32Memory0 = null;
    cachedUint8Memory0 = null;


    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;

    const imports = __wbg_get_imports();

    __wbg_init_memory(imports);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(input) {
    if (wasm !== undefined) return wasm;

    if (typeof input === 'undefined') {
        input = new URL('warp_ipfs_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }

    __wbg_init_memory(imports);

    const { instance, module } = await __wbg_load(await input, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync }
export default __wbg_init;
