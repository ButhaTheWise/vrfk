export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["data.json","favicon.svg","rendfokozatok/alezredes.jpeg","rendfokozatok/altabornagy.jpeg","rendfokozatok/dandartabornok.jpeg","rendfokozatok/ezredes.jpeg","rendfokozatok/fohadnagy.jpg","rendfokozatok/fotorzsormester.jpeg","rendfokozatok/fotorzszaszlos.jpeg","rendfokozatok/hadnagy.jpeg","rendfokozatok/ormester.jpeg","rendfokozatok/ornagy.jpeg","rendfokozatok/szazados.jpeg","rendfokozatok/torzsormester.jpeg","rendfokozatok/torzszaszlos.jpeg","rendfokozatok/vezerornagy.jpeg","rendfokozatok/zaszlos.jpeg"]),
	mimeTypes: {".json":"application/json",".svg":"image/svg+xml",".jpeg":"image/jpeg",".jpg":"image/jpeg"},
	_: {
		client: {start:"_app/immutable/entry/start.DhlDYJuf.js",app:"_app/immutable/entry/app.CrX5GSYF.js",imports:["_app/immutable/entry/start.DhlDYJuf.js","_app/immutable/chunks/BES3PZGa.js","_app/immutable/chunks/G5IqZ6B0.js","_app/immutable/entry/app.CrX5GSYF.js","_app/immutable/chunks/G5IqZ6B0.js","_app/immutable/chunks/Bple36bD.js","_app/immutable/chunks/BL9RboVD.js","_app/immutable/chunks/nRJePf2N.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api/admin/users",
				pattern: /^\/api\/admin\/users\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/admin/users/_server.js'))
			},
			{
				id: "/api/admin/users/[id]",
				pattern: /^\/api\/admin\/users\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/admin/users/_id_/_server.js'))
			},
			{
				id: "/api/admin/users/[id]/role",
				pattern: /^\/api\/admin\/users\/([^/]+?)\/role\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/admin/users/_id_/role/_server.js'))
			},
			{
				id: "/api/auth/login",
				pattern: /^\/api\/auth\/login\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/auth/login/_server.js'))
			},
			{
				id: "/api/auth/logout",
				pattern: /^\/api\/auth\/logout\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/auth/logout/_server.js'))
			},
			{
				id: "/api/auth/me",
				pattern: /^\/api\/auth\/me\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/auth/me/_server.js'))
			},
			{
				id: "/api/auth/register",
				pattern: /^\/api\/auth\/register\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/auth/register/_server.js'))
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
