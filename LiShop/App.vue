<script>
	export default {
		onLaunch: function(args) {
			console.log('App Launch')
			try {
				const scene = Number(args && args.scene) || 0
				const fromShare = scene === 1007 || scene === 1008 || scene === 1044 || scene === 1096 || scene === 1154 || scene === 1155
				if (fromShare) {
					try { uni.reLaunch({ url: '/pages/home/index' }) } catch (e) {}
				}
				const allowed = new Set(['/pages/search/index', '/pages/category/list'])
				allowed.add('/pages/category/index')
				allowed.add('/pages/home/index')
				allowed.add('/pages/login/index')
				const isLoggedIn = () => {
					try {
						const u = uni.getStorageSync('user') || null
						const exp = uni.getStorageSync('token_expiration') || 0
						return !!u && (!exp || Date.now() < exp)
					} catch (e) { return false }
				}
				const guard = (args) => {
					try {
						if (isLoggedIn()) return true
						const raw = (args && args.url) || ''
						const path = raw.split('?')[0]
						if (allowed.has(path)) return true
						try { uni.$emit('global-login-prompt', { from: path, ts: Date.now() }) } catch (e) {}
						return false
					} catch (e) { return false }
				}
				if (uni && typeof uni.addInterceptor === 'function') {
					uni.addInterceptor('navigateTo', { invoke: guard })
					uni.addInterceptor('switchTab', { invoke: guard })
					uni.addInterceptor('reLaunch', { invoke: guard })
					uni.addInterceptor('redirectTo', { invoke: guard })
				}
			} catch (e) {}
		},
		onShow: function(args) {
			console.log('App Show')
			try {
				const scene = Number(args && args.scene) || 0
				const fromShare = scene === 1007 || scene === 1008 || scene === 1044 || scene === 1096 || scene === 1154 || scene === 1155
				if (fromShare) {
					try { uni.reLaunch({ url: '/pages/home/index' }) } catch (e) {}
				}
			} catch (e) {}
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>
