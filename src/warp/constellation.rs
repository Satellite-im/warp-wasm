use crate::warp::stream::{stream_to_readablestream, AsyncIterator, InnerStream};
use futures::StreamExt;
use macro_utils::FromTo;
use serde::{Deserialize, Serialize};
use tsify_next::Tsify;
use uuid::Uuid;
use warp::constellation::{self, Constellation};
use warp::warp::dummy::Dummy;
use warp::warp::Warp;
use warp_ipfs::{WarpIpfs, WarpIpfsInstance};
use wasm_bindgen::prelude::*;

#[derive(Clone)]
#[wasm_bindgen]
pub struct ConstellationBox {
    inner: Warp<Dummy, Dummy, WarpIpfs>,
}
impl ConstellationBox {
    pub fn new(instance: &WarpIpfsInstance) -> Self {
        Self {
            inner: instance.clone().split_constellation(),
        }
    }
}

/// impl Constellation trait
#[wasm_bindgen]
impl ConstellationBox {
    pub fn modified(&self) -> js_sys::Date {
        self.inner.modified().into()
    }

    pub fn root_directory(&self) -> Directory {
        Directory {
            inner: self.inner.root_directory(),
        }
    }

    pub fn current_size(&self) -> usize {
        self.inner.current_size()
    }

    pub fn max_size(&self) -> usize {
        self.inner.max_size()
    }

    pub fn select(&mut self, path: &str) -> Result<(), JsError> {
        self.inner.select(path).map_err(|e| e.into())
    }

    pub fn set_path(&mut self, path: String) {
        self.inner.set_path(path.into())
    }

    pub fn get_path(&self) -> String {
        self.inner.get_path().to_string_lossy().into()
    }

    pub fn go_back(&mut self) -> Result<(), JsError> {
        self.inner.go_back().map_err(|e| e.into())
    }

    pub fn current_directory(&self) -> Result<Directory, JsError> {
        self.inner
            .current_directory()
            .map_err(|e| e.into())
            .map(|ok| Directory { inner: ok })
    }

    pub fn open_directory(&self, path: &str) -> Result<Directory, JsError> {
        self.inner
            .open_directory(path)
            .map_err(|e| e.into())
            .map(|ok| Directory { inner: ok })
    }

    pub async fn put_buffer(&mut self, name: &str, buffer: &[u8]) -> Result<(), JsError> {
        self.inner
            .put_buffer(name, buffer)
            .await
            .map_err(|e| e.into())
    }

    pub async fn get_buffer(&self, name: &str) -> Result<Vec<u8>, JsError> {
        self.inner
            .get_buffer(name)
            .await
            .map_err(|e| e.into())
            .map(|ok| ok.to_vec())
    }

    /// Returns a progression stream
    /// The result of the stream is of type {@link Progression}
    pub async fn put_stream(
        &mut self,
        name: &str,
        total_size: Option<usize>,
        stream: web_sys::ReadableStream,
    ) -> Result<AsyncIterator, JsError> {
        let stream = InnerStream::from(wasm_streams::ReadableStream::from_raw(stream));
        let stream = Box::pin(stream);
        self.inner
            .put_stream(name, total_size, stream)
            .await
            .map_err(|e| e.into())
            .map(|s| {
                AsyncIterator::new(Box::pin(
                    s.map(|t| serde_wasm_bindgen::to_value(&Progression::from(t)).unwrap()),
                ))
            })
    }

    /// Returns a file stream
    /// Each stream element is a byte array chunk of the file
    pub async fn get_stream(&self, name: &str) -> Result<web_sys::ReadableStream, JsError> {
        self.inner
            .get_stream(name)
            .await
            .map_err(|e| e.into())
            .map(|s| {
                let st = s.map(|val| {
                    val.map_err(|e| e.to_string()).and_then(|v| serde_wasm_bindgen::to_value(&v).map_err(|e| e.to_string())).unwrap()
                }).boxed();
                stream_to_readablestream(st)
            })
    }

    pub async fn rename(&mut self, current: &str, new: &str) -> Result<(), JsError> {
        self.inner.rename(current, new).await.map_err(|e| e.into())
    }

    pub async fn remove(&mut self, name: &str, recursive: bool) -> Result<(), JsError> {
        self.inner
            .remove(name, recursive)
            .await
            .map_err(|e| e.into())
    }

    pub async fn move_item(&mut self, from: &str, to: &str) -> Result<(), JsError> {
        self.inner.move_item(from, to).await.map_err(|e| e.into())
    }

    pub async fn create_directory(&mut self, name: &str, recursive: bool) -> Result<(), JsError> {
        self.inner
            .create_directory(name, recursive)
            .await
            .map_err(|e| e.into())
    }

    pub async fn sync_ref(&mut self, path: &str) -> Result<(), JsError> {
        self.inner.sync_ref(path).await.map_err(|e| e.into())
    }
}

#[wasm_bindgen]
#[derive(Clone)]
pub struct Directory {
    inner: constellation::directory::Directory,
}
#[wasm_bindgen]
impl Directory {
    pub fn new(name: &str) -> Self {
        Directory {
            inner: constellation::directory::Directory::new(name),
        }
    }
    pub fn has_item(&self, item_name: &str) -> bool {
        self.inner.has_item(item_name)
    }
    pub fn add_file(&self, file: File) -> Result<(), JsError> {
        self.inner.add_file(file.inner).map_err(|e| e.into())
    }
    pub fn add_directory(&self, directory: Directory) -> Result<(), JsError> {
        self.inner
            .add_directory(directory.inner)
            .map_err(|e| e.into())
    }
    pub fn get_item_index(&self, item_name: &str) -> Result<usize, JsError> {
        self.inner.get_item_index(item_name).map_err(|e| e.into())
    }
    pub fn rename_item(&self, current_name: &str, new_name: &str) -> Result<(), JsError> {
        self.inner
            .rename_item(current_name, new_name)
            .map_err(|e| e.into())
    }
    pub fn remove_item(&self, item_name: &str) -> Result<Item, JsError> {
        self.inner
            .remove_item(item_name)
            .map_err(|e| e.into())
            .map(|ok| ok.into())
    }
    pub fn remove_item_from_path(&self, directory: &str, item: &str) -> Result<Item, JsError> {
        self.inner
            .remove_item_from_path(directory, item)
            .map_err(|e| e.into())
            .map(|ok| ok.into())
    }
    pub fn move_item_to(&self, child: &str, dst: &str) -> Result<(), JsError> {
        self.inner.move_item_to(child, dst).map_err(|e| e.into())
    }
    pub fn get_items(&self) -> Vec<Item> {
        self.inner
            .get_items()
            .iter()
            .map(|i| Item::from(i.clone()))
            .collect()
    }
    pub fn set_items(&self, items: Vec<Item>) {
        self.inner.set_items(
            items
                .iter()
                .map(|i| constellation::item::Item::from(i.clone()))
                .collect(),
        )
    }
    pub fn add_item(&self, item: Item) -> Result<(), JsError> {
        self.inner.add_item(item).map_err(|e| e.into())
    }
    pub fn get_item(&self, item_name: &str) -> Result<Item, JsError> {
        self.inner
            .get_item(item_name)
            .map_err(|e| e.into())
            .map(|ok| ok.into())
    }
    pub fn find_item(&self, item_name: &str) -> Result<Item, JsError> {
        self.inner
            .find_item(item_name)
            .map_err(|e| e.into())
            .map(|ok| ok.into())
    }
    pub fn find_all_items(&self, item_names: Vec<String>) -> Vec<Item> {
        self.inner
            .find_all_items(item_names)
            .iter()
            .map(|i| Item::from(i.clone()))
            .collect()
    }
    pub fn get_last_directory_from_path(&self, path: &str) -> Result<Directory, JsError> {
        self.inner
            .get_last_directory_from_path(path)
            .map_err(|e| e.into())
            .map(|ok| Directory { inner: ok })
    }
    pub fn get_item_by_path(&self, path: &str) -> Result<Item, JsError> {
        self.inner
            .get_item_by_path(path)
            .map_err(|e| e.into())
            .map(|ok| ok.into())
    }
    pub fn name(&self) -> String {
        self.inner.name()
    }
    pub fn set_name(&self, name: &str) {
        self.inner.set_name(name)
    }
    pub fn set_thumbnail_format(&self, format: FileType) {
        let format: warp::constellation::file::FileType = format.into();
        self.inner.set_thumbnail_format(format.into())
    }
    pub fn thumbnail_format(&self) -> FileType {
        let format: warp::constellation::file::FileType = self.inner.thumbnail_format().into();
        format.into()
    }
    pub fn set_thumbnail(&self, desc: &[u8]) {
        self.inner.set_thumbnail(desc.to_vec())
    }
    pub fn thumbnail(&self) -> Vec<u8> {
        self.inner.thumbnail()
    }
    pub fn set_thumbnail_reference(&self, reference: &str) {
        self.inner.set_thumbnail_reference(reference)
    }
    pub fn thumbnail_reference(&self) -> Option<String> {
        self.inner.thumbnail_reference()
    }
    pub fn set_favorite(&self, fav: bool) {
        self.inner.set_favorite(fav)
    }
    pub fn favorite(&self) -> bool {
        self.inner.favorite()
    }
    pub fn description(&self) -> String {
        self.inner.description()
    }
    pub fn set_description(&self, desc: &str) {
        self.inner.set_description(desc)
    }
    pub fn size(&self) -> usize {
        self.inner.size()
    }
    pub fn set_creation(&self, creation: js_sys::Date) {
        self.inner.set_creation(creation.into())
    }
    pub fn set_modified(&self, modified: Option<js_sys::Date>) {
        self.inner.set_modified(modified.map(|d| d.into()))
    }
    pub fn path(&self) -> String {
        self.inner.path().to_string()
    }
    pub fn set_path(&mut self, new_path: &str) {
        self.inner.set_path(new_path)
    }
    pub fn id(&self) -> String {
        self.inner.id().to_string()
    }
    pub fn creation(&self) -> js_sys::Date {
        self.inner.creation().into()
    }
    pub fn modified(&self) -> js_sys::Date {
        self.inner.modified().into()
    }
}

#[wasm_bindgen]
#[derive(Clone)]
pub struct File {
    inner: constellation::file::File,
}

impl File {
    pub fn from_file(inner: constellation::file::File) -> File {
        File { inner }
    }
}

#[wasm_bindgen]
impl File {
    pub fn new(name: &str) -> File {
        File {
            inner: constellation::file::File::new(name),
        }
    }
    pub fn name(&self) -> String {
        self.inner.name()
    }
    pub fn set_id(&self, id: String) {
        self.inner.set_id(Uuid::parse_str(&id).unwrap())
    }
    pub fn set_name(&self, name: &str) {
        self.inner.set_name(name)
    }
    pub fn description(&self) -> String {
        self.inner.description()
    }
    pub fn set_description(&self, desc: &str) {
        self.inner.set_description(desc)
    }
    pub fn set_thumbnail_format(&self, format: FileType) {
        let format: warp::constellation::file::FileType = format.into();
        self.inner.set_thumbnail_format(format.into())
    }
    pub fn thumbnail_format(&self) -> FileType {
        let format: warp::constellation::file::FileType = self.inner.thumbnail_format().into();
        format.into()
    }
    pub fn set_thumbnail(&self, data: &[u8]) {
        self.inner.set_thumbnail(data.to_vec())
    }
    pub fn thumbnail(&self) -> Vec<u8> {
        self.inner.thumbnail()
    }
    pub fn set_favorite(&self, fav: bool) {
        self.inner.set_favorite(fav)
    }
    pub fn favorite(&self) -> bool {
        self.inner.favorite()
    }
    pub fn set_reference(&self, reference: &str) {
        self.inner.set_reference(reference)
    }
    pub fn set_thumbnail_reference(&self, reference: &str) {
        self.inner.set_thumbnail_reference(reference)
    }
    pub fn reference(&self) -> Option<String> {
        self.inner.reference()
    }
    pub fn thumbnail_reference(&self) -> Option<String> {
        self.inner.thumbnail_reference()
    }
    pub fn size(&self) -> usize {
        self.inner.size()
    }
    pub fn set_size(&self, size: usize) {
        self.inner.set_size(size)
    }
    pub fn set_creation(&self, creation: js_sys::Date) {
        self.inner.set_creation(creation.into())
    }
    pub fn set_modified(&self, modified: Option<js_sys::Date>) {
        self.inner.set_modified(modified.map(|d| d.into()))
    }
    pub fn hash(&self) -> Hash {
        self.inner.hash().into()
    }
    pub fn set_hash(&self, hash: Hash) {
        self.inner.set_hash(hash.into())
    }
    pub fn set_file_type(&self, file_type: FileType) {
        self.inner.set_file_type(file_type.into())
    }
    pub fn file_type(&self) -> FileType {
        self.inner.file_type().into()
    }
    pub fn path(&self) -> String {
        self.inner.path().to_string()
    }
    pub fn set_path(&mut self, new_path: &str) {
        self.inner.set_path(new_path)
    }
    pub fn id(&self) -> String {
        self.inner.id().to_string()
    }
    pub fn creation(&self) -> js_sys::Date {
        self.inner.creation().into()
    }
    pub fn modified(&self) -> js_sys::Date {
        self.inner.modified().into()
    }
}

#[wasm_bindgen]
#[derive(Clone)]
pub struct Item {
    inner: constellation::item::Item,
}
#[wasm_bindgen]
impl Item {
    pub fn new_file(file: File) -> Self {
        Self {
            inner: constellation::item::Item::new_file(file.inner),
        }
    }
    pub fn new_directory(directory: Directory) -> Self {
        Self {
            inner: constellation::item::Item::new_directory(directory.inner),
        }
    }

    pub fn file(&self) -> Option<File> {
        match &self.inner {
            constellation::item::Item::File(file) => Some(File {
                inner: file.clone(),
            }),
            constellation::item::Item::Directory(_) => None,
        }
    }
    pub fn directory(&self) -> Option<Directory> {
        match &self.inner {
            constellation::item::Item::File(_) => None,
            constellation::item::Item::Directory(dir) => Some(Directory { inner: dir.clone() }),
        }
    }
    pub fn id(&self) -> String {
        self.inner.id().to_string()
    }
    pub fn creation(&self) -> js_sys::Date {
        self.inner.creation().into()
    }
    pub fn modified(&self) -> js_sys::Date {
        self.inner.modified().into()
    }
    pub fn name(&self) -> String {
        self.inner.name()
    }

    pub fn description(&self) -> String {
        self.inner.description()
    }
    pub fn size(&self) -> usize {
        self.inner.size()
    }
    pub fn thumbnail_format(&self) -> FileType {
        let format: warp::constellation::file::FileType = self.inner.thumbnail_format().into();
        format.into()
    }
    pub fn thumbnail(&self) -> Vec<u8> {
        self.inner.thumbnail()
    }
    pub fn favorite(&self) -> bool {
        self.inner.favorite()
    }
    pub fn set_favorite(&self, fav: bool) {
        self.inner.set_favorite(fav)
    }
    pub fn rename(&self, name: &str) -> Result<(), JsError> {
        self.inner.rename(name).map_err(|e| e.into())
    }
    pub fn is_directory(&self) -> bool {
        self.inner.is_directory()
    }
    pub fn is_file(&self) -> bool {
        self.inner.is_file()
    }
    pub fn item_type(&self) -> ItemType {
        self.inner.item_type().into()
    }
    pub fn set_description(&self, desc: &str) {
        self.inner.set_description(desc)
    }
    pub fn set_thumbnail(&self, data: &[u8]) {
        self.inner.set_thumbnail(data.to_vec())
    }
    pub fn set_thumbnail_format(&self, format: FileType) {
        let format: warp::constellation::file::FileType = format.into();
        self.inner.set_thumbnail_format(format.into())
    }
    pub fn set_size(&self, size: usize) -> Result<(), JsError> {
        self.inner.set_size(size).map_err(|e| e.into())
    }
    pub fn path(&self) -> String {
        self.inner.path().to_string()
    }
    pub fn set_path(&mut self, new_path: &str) {
        self.inner.set_path(new_path)
    }
    pub fn get_directory(&self) -> Result<Directory, JsError> {
        self.inner
            .get_directory()
            .map_err(|e| e.into())
            .map(|ok| Directory { inner: ok })
    }
    pub fn get_file(&self) -> Result<File, JsError> {
        self.inner
            .get_file()
            .map_err(|e| e.into())
            .map(|ok| File { inner: ok })
    }
}
impl From<constellation::item::Item> for Item {
    fn from(value: constellation::item::Item) -> Self {
        Self { inner: value }
    }
}
impl From<Item> for constellation::item::Item {
    fn from(value: Item) -> Self {
        value.inner
    }
}

#[derive(Tsify, Serialize, FromTo)]
#[from_to(constellation::Progression, only = "from")]
#[serde(tag = "kind", content = "values", rename_all="snake_case")]
pub enum Progression {
    CurrentProgress {
        /// name of the file
        name: String,

        /// size of the progression
        current: usize,

        /// total size of the file, if any is supplied
        total: Option<usize>,
    },
    ProgressComplete {
        /// name of the file
        name: String,

        /// total size of the file, if any is supplied
        total: Option<usize>,
    },
    ProgressFailed {
        /// name of the file that failed
        name: String,

        /// last known size, if any, of where it failed
        last_size: Option<usize>,

        /// error of why it failed, if any
        error: String,
    },
}

#[derive(FromTo)]
#[from_to(warp::constellation::item::ItemType)]
#[wasm_bindgen]
pub enum ItemType {
    FileItem,
    DirectoryItem,
    InvalidItem,
}

#[wasm_bindgen]
pub struct Hash(warp::constellation::file::Hash);

#[wasm_bindgen]
impl Hash {
    pub fn sha256(&self) -> Option<String> {
        self.0.sha256()
    }
}

impl From<warp::constellation::file::Hash> for Hash {
    fn from(value: warp::constellation::file::Hash) -> Self {
        Hash(value)
    }
}

impl From<Hash> for warp::constellation::file::Hash {
    fn from(value: Hash) -> Self {
        value.0
    }
}

#[derive(Tsify, Clone, Deserialize, Serialize, FromTo)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[from_to(constellation::file::FileType)]
pub enum FileType {
    Generic,
    Mime(#[from_to(from = "{f_0}.parse().unwrap()")] String),
}
