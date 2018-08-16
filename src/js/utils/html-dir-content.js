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
**/

/* html-dir-content v0.1.3 (c) 2017, Yoav Niran, https://github.com/yoavniran/html-dir-content.git/blob/master/LICENSE */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	(factory((global.htmlDirContent = {})));
}(this, (function (exports) {

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var OPTS_SYM = "opts_init";
var BAIL_LEVEL = 1000000;
var arrayConcat = Array.prototype.concat;

var initOptions = function initOptions(options) {
    var _ref;

    return options[OPTS_SYM] === true ? options : (_ref = {}, _defineProperty(_ref, OPTS_SYM, true), _defineProperty(_ref, "recursive", options === true || !!options.recursive), _defineProperty(_ref, "bail", options.bail && options.bail > 0 ? options.bail : BAIL_LEVEL), _ref);
};

var getFileFromFileEntry = function getFileFromFileEntry(entry) {
    return new Promise(function (resolve, reject) {

        if (entry.file) {
            entry.file(resolve, reject);
        }else if (entry.isDirectory) {
						readEntries(entry, resolve)
        } else {
            resolve(null);
        }
    }).catch(function () {
        //swallow errors
        return null;
    });
};

var isItemFileEntry = function isItemFileEntry(item) {

    return item.kind === "file";
};

var getAsEntry = function getAsEntry(item) {

    return item.getAsEntry ? item.getAsEntry() : item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
};

var getListAsArray = function getListAsArray(list) {
    return (//returns a flat array
        arrayConcat.apply([], list)
    );
};

var getEntryData = function getEntryData(entry, options, level) {
    var promise = void 0;


    if (entry.isDirectory) {

			promise = getFileList(entry, options, level + 1).then(function (file) {

					return file ? [{file:file, entry: entry}] : [{file:entry, entry: entry}];
			});

    } else {
        promise = getFileFromFileEntry(entry).then(function (file) {
            return file ? [{file:file, entry: entry}] : [{file:entry, entry: entry}];
        });
    }

    return promise;
};

var readEntries = function(reader, resolve){

		let allEntries = []
		function readEntriesRecursive(){
			reader.readEntries(function (entries) {

				if(entries.length > 0){
					allEntries = allEntries.concat(entries)
					readEntriesRecursive()
				}else{

					resolve(allEntries)
				}
			})
		}

		readEntriesRecursive()
}
/**
 * returns a flat list of files for root dir item
 * if recursive is true will get all files from sub folders
 */
var getFileList = function getFileList(root, options) {
    var level = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    return root && level < options.bail && root.isDirectory && root.createReader ? new Promise(function (resolve) {

				let reader = root.createReader()
				new Promise(function(resolveEntries){
					readEntries(reader, resolveEntries)

				}).then(function(entries) {

            return Promise.all(entries.map(function (entry) {

								var file = getEntryData(entry, options, level)

                return file;
            })).then(function (results) {

                return resolve(results);
            });
        }, //flatten the results
        function () {
            return resolve([]);
        }); //fail silently
    }) : Promise.resolve([]);
};

/**
 * returns a Promise<Array<File>> of File objects for the provided item if it represents a directory
 * will attempt to retrieve all of its children files (optionally recursively)
 * @param item: DataTransferItem
 * @param options (optional)
 *  {options.recursive} (default: false) - whether to recursively follow the dir structure
 *  {options.bail} (default: 1000) - how many levels to follow recursively before bailing
 */
var getFiles = function getFiles(item) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return getFileList(getAsEntry(item), initOptions(options));
};

var getDataTransferItemFiles = function getDataTransferItemFiles(item, options) {

    return getFiles(item, options).then(function (files) {

        if (!files.length) {
            //perhaps its a regular file
						//
            var file = item.getAsFile();
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
var getFilesFromDragEvent = function getFilesFromDragEvent(evt) {
	
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    options = initOptions(options);

    return new Promise(function (resolve) {

        if (evt.dataTransfer.items) {
            Promise.all(getListAsArray(evt.dataTransfer.items).filter(function (item) {

							  return isItemFileEntry(item);
            }).map(function (item) {

                return getDataTransferItemFiles(item, options);
            })).then(function (files) {

                return resolve(getListAsArray(files));
            });
        } else if (evt.dataTransfer.files) {
            resolve(getListAsArray(evt.dataTransfer.files)); //turn into regular array (instead of FileList)
        } else {
            resolve([]);
        }
    });
};

exports.getFiles = getFiles;
exports.getFilesFromDragEvent = getFilesFromDragEvent;

Object.defineProperty(exports, '__esModule', { value: true });

})));
