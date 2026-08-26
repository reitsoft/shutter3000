<script lang="ts">
  import { page } from '$app/state';
  import { resolve } from '$app/paths';
  import House from '@lucide/svelte/icons/house';
  import Zap from '@lucide/svelte/icons/zap';
  import PanelsTopLeft from '@lucide/svelte/icons/panels-top-left';

  const items = [
    { href: resolve('/'), label: 'Haus', icon: House },
    { href: resolve('/shutters'), label: 'Rollos', icon: PanelsTopLeft },
    { href: resolve('/electricity'), label: 'Strom', icon: Zap }
  ];
</script>

<nav
  class="fixed bottom-0 left-0 right-0 h-16 flex justify-around items-center bg-navy-900 border-t-4 border-navy-800 z-50"
  style="padding-bottom: env(safe-area-inset-bottom);"
>
  {#each items as item (item.href)}
    {@const active = item.href === '/' 
    ? page.url.pathname === item.href 
    : page.url.pathname.startsWith(item.href)}
    <a
      href={item.href}
      aria-current={active ? 'page' : undefined}
      class="flex flex-col items-center gap-1 min-w-16 transition-colors
        {active ? 'text-orange-500' : 'text-cream-100/50'}"
    >
      <item.icon class="w-5 h-5 stroke-2" />
      <span class="text-[11px] font-semiold tracking-wider uppercase">{item.label}</span>
    </a>
  {/each}
</nav>