<!-- $lib/components/home/PageHeader.svelte -->
<script lang="ts">
	let { title }: { title: string } = $props();
</script>

<header class="flex w-full shrink-0 items-center justify-between px-6 pt-7 pb-2">
	<div>
		<h1
			class="font-handwriting font-bold tracking-wide whitespace-nowrap text-cream-100"
			style="font-size: clamp(1.25rem, 7vw, 2.25rem);"
		>
			{title}
		</h1>
	</div>
</header>