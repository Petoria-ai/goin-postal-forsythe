// The staff menu (Peter, Nov 25 2026, to-do P19: "this area looks alittle clunky"): four groups instead of one line of
// 20 links. Used by components/StaffNav.astro on every counter page and by the counter home page. To add a page, add
// one line here. `min` hides a link from lower roles (the page itself still checks the PIN on every action).
export type NavLink = { href: string; key: string; label: string; min?: 'manager' | 'owner' };
export type NavGroup = { key: string; label: string; links: NavLink[] };

// A group with no links left (Shipping, today) isn't shown; see `visibleNav`.
export const STAFF_NAV: NavGroup[] = [
  { key: 'st.nav.g.shipping', label: 'Shipping', links: [
    // { href: '/counter/queue', key: 'st.nav.queue', label: 'Queue' }, // off the menu (Peter, Nov 25 2026); page still works
    // Drop-offs (/counter/dropoff) is off the menu (Peter, Nov 25 2026): GP Rate Pro already scans drop-offs and gives the
    // receipt. The page still works by its address; put this line back if PeterShip replaces GP Rate Pro:
    // { href: '/counter/dropoff', key: 'st.nav.dropoffs', label: 'Drop-offs' },
    // { href: '/counter/pickups', key: 'st.nav.pickups', label: 'Pickups' }, // off the menu (Peter, Nov 25 2026); page still works
    // { href: '/counter/scan', key: 'st.nav.scan', label: 'Scan a QR' }, // off the menu (Peter, Nov 25 2026); page still works
    // { href: '/counter/batch', key: 'st.nav.batch', label: 'Batch' }, // off the menu (Peter, Nov 25 2026): buys labels through PeterShip; the store uses GP Rate Pro
    // { href: '/counter/fulfillment', key: 'st.nav.fulfillment', label: 'Fulfillment' }, // off the menu (Peter, Nov 25 2026): turned off until there is shelf space for sellers' stock (to-do P21)
    // Exceptions (/counter/exceptions) is off the menu too (Peter, Nov 25 2026): it only watches labels made through
    // PeterShip, and the store makes labels in GP Rate Pro. It starts filling by itself if PeterShip makes the labels:
    // { href: '/counter/exceptions', key: 'st.nav.exceptions', label: 'Exceptions' },
    // { href: '/counter/claims', key: 'st.nav.claims', label: 'Claims' }, // off the menu (Peter, Nov 25 2026): claims on PeterShip labels; the store uses GP Rate Pro
  ] },
  { key: 'st.nav.g.mail', label: 'Mailboxes', links: [
    { href: '/counter/mailboxes', key: 'st.nav.mailboxes', label: 'Mailboxes' },
    { href: '/counter/virtual', key: 'st.nav.virtual', label: 'Virtual mail' },
  ] },
  { key: 'st.nav.g.customers', label: 'Customers', links: [
    { href: '/counter/customers', key: 'st.nav.customers', label: 'Customers' },
    { href: '/counter/accounts', key: 'st.nav.accounts', label: 'Accounts' },
    { href: '/counter/invoices', key: 'st.nav.invoices', label: 'Invoices' },
    { href: '/counter/print', key: 'st.nav.printorders', label: 'Print orders' },
  ] },
  { key: 'st.nav.g.store', label: 'Store', links: [
    { href: '/counter/close', key: 'st.nav.close', label: 'End of day' },
    { href: '/counter/reports', key: 'st.nav.reports', label: 'Reports' },
    { href: '/counter/rules', key: 'st.nav.prices', label: 'Prices', min: 'manager' },
    { href: '/counter/staff', key: 'st.nav.staff', label: 'Staff', min: 'manager' },
    { href: '/counter/settings', key: 'st.nav.settings', label: 'Settings', min: 'manager' },
    { href: '/counter/export', key: 'st.nav.export', label: 'Export', min: 'manager' },
  ] },
];

/** The groups that still have links (an empty group, like Shipping while labels come from GP Rate Pro, is hidden). */
export const visibleNav = () => STAFF_NAV.filter((g) => g.links.length > 0);
