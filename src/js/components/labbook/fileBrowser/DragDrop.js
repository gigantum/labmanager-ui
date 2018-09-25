const DragAndDrop = {
  dragAndDrop: () => {
    	document.getElementById('OutputData_files').addEventListener('drop', (e) => {
    		e.stopPropagation();
    		e.preventDefault();

    		const uploadFile = function (file, path) {

    			// handle file uploading
    		};

    		var iterateFilesAndDirs = function (filesAndDirs, path) {
    			for (let i = 0; i < filesAndDirs.length; i++) {
    				if (typeof filesAndDirs[i].getFilesAndDirectories === 'function') {
    					var path = filesAndDirs[i].path;

    					// this recursion enables deep traversal of directories
    					filesAndDirs[i].getFilesAndDirectories().then((subFilesAndDirs) => {
    						// iterate through files and directories in sub-directory
    						iterateFilesAndDirs(subFilesAndDirs, path);
    					});
    				} else {
    					uploadFile(filesAndDirs[i], path);
    				}
    			}
    		};

    		// begin by traversing the chosen files and directories
    		if ('getFilesAndDirectories' in e.dataTransfer) {
    			e.dataTransfer.getFilesAndDirectories().then((filesAndDirs) => {
    				iterateFilesAndDirs(filesAndDirs, '/');
    			});
    		}
    	});
  },
};

export default DragAndDrop;
