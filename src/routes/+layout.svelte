<script lang="ts">
	import '../global.scss';
</script>

<nav>
	<h1>名前のない走り書き。</h1>
</nav>

<main>
	<slot />
</main>

<style lang="scss">
	nav {
		background: #fff;
		padding: 1rem 2rem;

		h1 {
			font-size: 1.5rem;
			font-weight: 700;
			margin: 0;
			color: #48b0d5;
		}
	}
	main {
		padding: 1rem 4rem;

		@media (max-width: 768px) {
			padding: 1rem 2rem;
		}
	}
</style>
