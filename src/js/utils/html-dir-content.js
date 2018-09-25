/**
Copyright 2017 Yoav Niran

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
* */

/* html-dir-content v0.1.3 (c) 2017, Yoav Niran, https://github.com/yoavniran/html-dir-content.git/blob/master/LICENSE */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    (factory((global.htmlDirContent = {})));
}(this, ((exports) => {
  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value, enumerable: true, configurable: true, writable: true,
      });
    } else { obj[key] = value; } return obj;
  }

  const OPTS_SYM = 'opts_init';
  const BAIL_LEVEL = 1000000;
  const arrayConcat = Array.prototype.concat;

  const initOptions = function initOptions(options) {
    let _ref;

    return options[OPTS_SYM] === true ? options : (_ref = {}, _defineProperty(_ref, OPTS_SYM, true), _defineProperty(_ref, 'recursive', options === true || !!options.recursive), _defineProperty(_ref, 'bail', options.bail && options.bail > 0 ? options.bail : BAIL_LEVEL), _ref);
  };

  const getFileFromFileEntry = function getFileFromFileEntry(entry) {
    return new Promise(((resolve, reject) => {
      if (entry.file) {
        entry.file(resolve, reject);
      } else if (entry.isDirectory) {
        readEntries(entry, resolve);
      } else {
        resolve(null);
      }
    })).catch(() =>
    // swallow errors
      null);
  };

  const isItemFileEntry = function isItemFileEntry(item) {
    return item.kind === 'file';
  };

  const getAsEntry = function getAsEntry(item) {
    return item.getAsEntry ? item.getAsEntry() : item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
  };

  const getListAsArray = function getListAsArray(list) {
    return (// returns a flat array
      arrayConcat.apply([], list)
    );
  };

  const getEntryData = function getEntryData(entry, options, level) {
    let promise = void 0;


    if (entry.isDirectory) {
      promise = getFileList(entry, options, level + 1).then(file => (file ? [{ file, entry }] : [{ file: entry, entry }]));
    } else {
      promise = getFileFromFileEntry(entry).then(file => (file ? [{ file, entry }] : [{ file: entry, entry }]));
    }

    return promise;
  };

  var readEntries = function (reader, resolve) {
    let allEntries = [];
    function readEntriesRecursive() {
      reader.readEntries((entries) => {
        if (entries.length > 0) {
          allEntries = allEntries.concat(entries);
          readEntriesRecursive();
        } else {
          resolve(allEntries);
        }
      });
    }

    readEntriesRecursive();
  };
  /**
 * returns a flat list of files for root dir item
 * if recursive is true will get all files from sub folders
 */
  var getFileList = function getFileList(root, options) {
    const level = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    return root && level < options.bail && root.isDirectory && root.createReader ? new Promise(((resolve) => {
      const reader = root.createReader();
      new Promise(((resolveEntries) => {
        readEntries(reader, resolveEntries);
      })).then(
        entries => Promise.all(entries.map((entry) => {
          const file = getEntryData(entry, options, level);

          return file;
        })).then(results => resolve(results)), // flatten the results
        () => resolve([]),
      ); // fail silently
    })) : Promise.resolve([]);
  };

  /**
 * returns a Promise<Array<File>> of File objects for the provided item if it represents a directory
 * will attempt to retrieve all of its children files (optionally recursively)
 * @param item: DataTransferItem
 * @param options (optional)
 *  {options.recursive} (default: false) - whether to recursively follow the dir structure
 *  {options.bail} (default: 1000) - how many levels to follow recursively before bailing
 */
  const getFiles = function getFiles(item) {
    const options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return getFileList(getAsEntry(item), initOptions(options));
  };

  const getDataTransferItemFiles = function getDataTransferItemFiles(item, options) {
    return getFiles(item, options).then((files) => {
      if (!files.length) {
        // perhaps its a regular file
        //
        const file = item.getAsFile();
        files = file ? [file] : files;
      }

      return files;
    });
  };

  /**
 * returns a Promise<Array<File>> for the File objects found in the dataTransfer data of a drag&drop event
 * In case a directory is found, will attempt to retrieve all of its children files (optionally recursively)
 *
 * @param evt: DragEvent - containing dataTransfer
 * @param options (optional)
 *  {options.recursive} (default: false) - whether to recursively follow the dir structure
 *  {options.bail} (default: 1000) - how many levels to follow recursively before bailing
 */
  const getFilesFromDragEvent = function getFilesFromDragEvent(evt) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    options = initOptions(options);

    return new Promise(((resolve) => {
      if (evt.dataTransfer.items) {
        Promise.all(getListAsArray(evt.dataTransfer.items).filter(item => isItemFileEntry(item)).map(item => getDataTransferItemFiles(item, options))).then(files => resolve(getListAsArray(files)));
      } else if (evt.dataTransfer.files) {
        resolve(getListAsArray(evt.dataTransfer.files)); // turn into regular array (instead of FileList)
      } else {
        resolve([]);
      }
    }));
  };

  exports.getFiles = getFiles;
  exports.getFilesFromDragEvent = getFilesFromDragEvent;

  Object.defineProperty(exports, '__esModule', { value: true });
})));
