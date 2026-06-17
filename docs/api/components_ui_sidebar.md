# API Reference: sidebar

Source file: `components/ui/sidebar.tsx`

## Whitelisted API Endpoints

### `function useSidebar()`
*No documentation provided (generation failed).*

### `function button(<Comp ref={ref} data-sidebar="menu-button" data-size={size} data-active={isActive} className={cn(sidebarMenuButtonVariants({ variant, size }), className)} {...props} /> ); if (!tooltip) { return button; } if (typeof tooltip === "string") { tooltip = { children: tooltip, }; } return ( <Tooltip> <TooltipTrigger asChild>{button}</TooltipTrigger> <TooltipContent side="right" align="center" hidden={state !== "collapsed" || isMobile} {...tooltip} /> </Tooltip> ); }, ); SidebarMenuButton.displayName = "SidebarMenuButton"; const SidebarMenuAction = React.forwardRef< HTMLButtonElement, React.ComponentProps<"button"> & { asChild?: boolean; showOnHover?: boolean } >(({ className, asChild = false, showOnHover = false, ...props }, ref)`
*No documentation provided (generation failed).*
