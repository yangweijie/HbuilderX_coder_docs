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
	hx.window.showQuickPick(items, {
		placeHolder: "请选择您要查看的关键词"
	}).then(function(result) {
		if (!result) {
			return;
		}
		let text = result.path;
		console.log("您选择的内容是：", text);
		showContent(code, text);
	});
}

// function showContent(code, file){
// 	var current_dir = __dirname;
// 	let uri = path.join(current_dir, `/docs/`+ file);
// 	console.log(uri);
// 	var html = fs.readFileSync(uri, 'utf8');
// 	hx.window.showInformationMessage(html);
// }

function showContent(code, file){
	var current_dir = __dirname;
	let uri = path.join(current_dir, `/docs/`+ file);
	console.log(uri);
	hx.workspace.openTextDocument(uri);
	return ;
	var html = fs.readFileSync(uri, 'utf8');
	// hx.window.showInformationMessage(html);
	let editorPromise = hx.window.getActiveTextEditor();
	editorPromise.then((editor)=>{
		let workspaceEdit = new hx.WorkspaceEdit();
		let edits = [];
		edits.push(new hx.TextEdit({
			start: 0,
			end: 0
		}, html));

		workspaceEdit.set(editor.document.uri,edits);
		hx.workspace.applyEdit(workspaceEdit);
	});
}

//该方法将在插件激活的时候调用
function activate(context) {
	let search = hx.commands.registerCommand('extension.coderDocsSearch', () => {
		let config = hx.workspace.getConfiguration();
		if(config.get('coderDocs.current') === undefined){
			console.log('没有配置过');
			hx.window.showErrorMessage('没有配置过当前查看的手册');
			return;
		}
		getToken(config.get('coderDocs.current'));
	});
	//订阅销毁钩子，插件禁用的时候，自动注销该command。
	let config = hx.commands.registerCommand('extension.coderDocsConfig', () => {
		let doc_list = docList();
		let items = [];
		let doc_list_arr = JSON.parse(doc_list);
		for (let item in doc_list_arr) {
			let code = doc_list_arr[item].features.code;
			items.push({
				label: `<span style="color:red">${code}</span>`,
				description: `123`,
				code : doc_list_arr[item].features.code
			});
		}
		hx.window.showQuickPick(items, {
			placeHolder: "请选择您要查询的手册"
		}).then(function(result) {
			if (!result) {
				return;
			}
			let text = result.code;
			console.log("您选择的内容是：", text);
			let config = hx.workspace.getConfiguration();
			config.update('coderDocs.current', result.code);
		});
	});
	context.subscriptions.push(search);
	context.subscriptions.push(config);
}
//该方法将在插件禁用的时候调用（目前是在插件卸载的时候触发）
function deactivate() {

}
module.exports = {
	activate,
	deactivate
}
