var hx = require("hbuilderx");
var fs = require('fs');
var path = require("path");

function docList(){
	var current_dir = __dirname;
	let uri = path.join(__dirname, '/features/default.json');
	let data = fs.readFileSync(uri, 'utf8');
	console.log(data);
	return data;
}

function getToken(code){
	var current_dir = __dirname;
	let uri = path.join(__dirname, '/index/'+code+'.json');
	let data = fs.readFileSync(uri, 'utf8');
	let data_arr = JSON.parse(data);
	let items = [];
	for (let item in data_arr) {
		let code = data_arr[item];
		code.label = code.name;
		// <span style="background-image:url(${icon});width:20px;height:20px;"></span>
		// console.log(item, doc_list_arr[item]); // js 遍历对象属性 获得的是key 不是对象
		items.push(code);
	}
	hx.window.showQuickPick(items);
}

function showContent(code, token){
	
}

//该方法将在插件激活的时候调用
function activate(context) {
	let disposable = hx.commands.registerCommand('extension.helloWorld', () => {
		var current_dir = __dirname;
		let uri = path.join(current_dir, 'str.html');
		console.log(uri);
		let doc_list = docList();
		// let phpdoc = doc_list.php;
		let items = [];
		let doc_list_arr = JSON.parse(doc_list);
		let img_blob = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAE6WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDIgNzkuMTYwOTI0LCAyMDE3LzA3LzEzLTAxOjA2OjM5ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAxOS0wNS0wNlQwMjowNjo1NiswODowMCIgeG1wOk1vZGlmeURhdGU9IjIwMTktMDUtMDZUMDI6MDc6MjQrMDg6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMTktMDUtMDZUMDI6MDc6MjQrMDg6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjA5YTE5YjdlLTE4OTYtZTE0MS1hNGRlLWFmYWFmZGFkNzBkZSIgeG1wTU06RG9jdW1lbnRJRD0ieG1w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';
		// console.log(JSON.parse(doc_list));
		for (let item in doc_list_arr) {
			let icon = path.join(current_dir, '/'+doc_list_arr[item].features.icon);
			let code = doc_list_arr[item].features.code;
			console.log(icon);
			// <span style="background-image:url(${icon});width:20px;height:20px;"></span>
			// console.log(item, doc_list_arr[item]); // js 遍历对象属性 获得的是key 不是对象
			items.push({
				label: `<span style="color:red">${code}</span>`,
				code : doc_list_arr[item].features.code
			});
		}
		
		getToken(items[1].code);
		
		// let config = hx.workspace.getConfiguration();
		// if(config.get('coderDocs.current') === undefined){
		// 	console.log('没有配置过');
		// }
		// config.update('coderDocs.current', 'php');
		
		// console.log(config.get('coderDocs.current'));
		// hx.window.showQuickPick(items);
		// TODO quick_picker 里显示图片
		// var html = fs.readFileSync(uri, 'utf8');
		// console.log(html);
		// html = '<div width="1920" height="1080" align="center"><div width="200">aa</div></div>'
		// hx.window.showInformationMessage(html);
	});
	//订阅销毁钩子，插件禁用的时候，自动注销该command。
	context.subscriptions.push(disposable);
}
//该方法将在插件禁用的时候调用（目前是在插件卸载的时候触发）
function deactivate() {

}
module.exports = {
	activate,
	deactivate
}
