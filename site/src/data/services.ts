// Every service page on the site, one entry each. Add a service here and it gets its page, title,
// description, canonical URL, breadcrumbs, Service + FAQ structured data, a sitemap entry, a line in
// llms.txt and a place in the SEO check, with no other file to touch.
//
// Content rules:
// - Publish only what the store really does. A service that is not ready stays `status: 'draft'`.
// - No invented prices, transit times, partners or guarantees. "Call for a quote" is honest; a guess is not.
// - The store is independently owned. Never describe it as a UPS, FedEx, USPS or DHL corporate location.
// - Weekend copy: the store is open Saturday and Sunday, but carrier pickup days are the carriers'.
//   Say that weekend drop-offs leave with the next scheduled pickup; never promise weekend transit.
// - Hours, phone and address come from {tokens} (see src/lib/richtext.ts), never typed in.
//
// Overlapping searches are consolidated on purpose so pages do not compete with each other:
// package drop-off + prepaid label drop-off -> /shipping/drop-off; professional + custom box packing ->
// /shipping/packing; personal mailbox + package receiving -> /mailboxes/physical; business address +
// small business mailbox -> /mailboxes/business-address; printing + copying -> /business-services/printing.
import type { ServiceEntry } from './content-types';

const UPDATED = '2026-11-28';

const weekendNote = 'Packages dropped off on a Saturday or Sunday leave with the next scheduled carrier pickup. Ask at the counter for that day\'s cutoff.';
const independent = '{name} is an independently owned and operated shipping store. We are not a UPS, FedEx, USPS or DHL corporate location; we ship with all of them.';

export const SERVICES: ServiceEntry[] = [
  // ============================================================== SHIPPING
  {
    category: 'shipping', slug: '', name: 'Shipping',
    h1: 'Shipping store in Monroe, Louisiana',
    title: 'Shipping Store in Monroe, LA: UPS, FedEx, USPS & DHL',
    description: 'Ship UPS, FedEx, USPS and DHL from one counter at {street}, Monroe. Packing, drop-offs and labels. Open 7 days, weekdays until {weekdayClose}.',
    intro: '{name} ships with **UPS, FedEx, USPS and DHL** from one counter at {street} in Monroe. Bring the item, packed or not, and we compare carriers, pack it, print the label and hand it to the carrier. We are open {daysOpen} days a week, weekdays until {weekdayClose}, so you can ship after work or on the weekend.',
    sections: [
      { h: 'One counter, four carriers', body: [
        'Most shipping locations sell one carrier. We put UPS, FedEx, USPS and DHL side by side so you can choose by price, speed or the carrier you trust. Not sure which to pick? Tell us when it needs to arrive and we will show you the options.',
        independent,
      ] },
      { h: 'What we ship', list: [
        '[Domestic packages](/shipping/domestic) anywhere in the United States',
        '[International shipments](/shipping/international), including [boxes to Vietnam](/shipping/vietnam)',
        '[Fragile items](/shipping/fragile), [heavy and oversized items](/shipping/heavy-oversized) and [freight on pallets](/shipping/freight)',
        '[Returns](/shipping/returns) for online purchases and [prepaid drop-offs](/shipping/drop-off)',
      ] },
      { h: 'Ship online or at the counter', onlineOnly: true, body: [
        'For U.S. addresses you can compare rates and buy a label online with [PeterShip](/ship), our own shipping tool, then print at home or show the QR code at the counter. International shipments, freight and anything that needs packing are handled in person.',
      ] },
      { h: 'Open seven days, including evenings', body: [
        'Weekdays {weekdayHours}. Saturday {saturdayHours}. Sunday {sundayHours}. ' + weekendNote,
      ] },
    ],
    pricing: 'Carrier rates depend on weight, size, distance and speed. We quote every carrier before you pay; packing materials and services are priced separately and shown before you agree.',
    providers: ['UPS', 'FedEx', 'USPS', 'DHL'],
    faqs: [
      { q: 'Which carriers can I ship with at {name}?', a: 'UPS, FedEx, USPS and DHL. We compare them at the counter so you can choose by price or delivery time.' },
      { q: 'Are you open on weekends?', a: 'Yes. We are open Saturday {saturdayHours} and Sunday {sundayHours}. Packages dropped off on a weekend leave with the next scheduled carrier pickup.' },
      { q: 'Can I ship after work?', a: 'Yes. We are open until {weekdayClose} Monday through Friday.' },
      { q: 'Do I need to pack my item before I come in?', a: 'No. Bring it as it is and we will pack it, or bring it already boxed and we will label it.' },
      { q: 'Are you a UPS Store or a FedEx Office?', a: 'No. {name} is an independently owned shipping store that ships with UPS, FedEx, USPS and DHL, so you can compare carriers in one place.' },
    ],
    related: ['/shipping/packing', '/shipping/drop-off', '/shipping/international', '/mailboxes'],
    cta: [{ label: 'Compare rates online', href: '/ship', track: 'shipping_quote_start' }, { label: 'Ask for a quote', href: '/contact', track: 'quote_request_click' }, { label: 'Call for a quote', href: 'tel', track: 'phone_click' }],
    status: 'published', updated: UPDATED,
    keywords: ['shipping store Monroe LA', 'shipping center near me', 'shipping store open seven days a week', 'alternatives to The UPS Store in Monroe'],
  },
  {
    category: 'shipping', slug: 'domestic', name: 'Domestic shipping',
    h1: 'Domestic shipping from Monroe, LA',
    title: 'Domestic Shipping in Monroe, LA: Compare Carriers',
    description: 'Send packages anywhere in the U.S. from Monroe with UPS, FedEx, USPS or DHL. We compare ground and express rates for you at the counter.',
    intro: 'To ship a package anywhere in the United States, bring it to {name} at {street} or call {phone} for a quote. We compare ground, two-day and overnight options across carriers so you see every price before you pay.',
    sections: [
      { h: 'Ground, two-day or overnight', body: [
        'Ground services are usually the lowest price for packages that do not need to arrive on a set day. Express services cost more and arrive faster, often with a delivery date the carrier commits to. We show both so you can decide.',
      ] },
      { h: 'Buy online, drop off here', onlineOnly: true, body: [
        '[PeterShip](/ship) quotes USPS, UPS, FedEx and DHL for U.S. addresses, including Puerto Rico, the U.S. territories and military APO, FPO and DPO addresses. Pay by card, then print the label at home or show the QR code at the counter and we print it for you.',
      ] },
      { h: 'Size and weight limits', table: {
        caption: 'Published carrier maximums for a single package. Some services have lower limits.',
        head: ['Carrier', 'Maximum weight', 'Maximum size'],
        rows: [
          ['USPS', '70 lb', '130 in length plus girth'],
          ['UPS', '150 lb', '165 in length plus girth, 108 in long'],
          ['FedEx', '150 lb', '165 in length plus girth, 108 in long'],
        ],
      }, body: ['Over those limits? See [heavy and oversized shipping](/shipping/heavy-oversized) or [freight](/shipping/freight).'] },
    ],
    pricing: 'The price is the carrier rate for the service you choose plus any packing. The quote shows every carrier\'s price before you pay.',
    providers: ['UPS', 'FedEx', 'USPS', 'DHL'],
    faqs: [
      { q: 'What is the cheapest way to ship a package in the U.S.?', a: 'It depends on weight, size and distance. Light packages are often cheapest with USPS; heavier boxes can be cheaper with UPS or FedEx Ground. We quote all of them so you can see.' },
      { q: 'Can I buy a shipping label online and drop it off?', onlineOnly: true, a: 'Yes. Buy it on our PeterShip page, then print it at home or show the QR code at our counter and we print and attach it.' },
      { q: 'How do I get a shipping quote?', a: 'Bring the package in or call {phone} with its weight, size and the destination ZIP code. We compare UPS, FedEx, USPS and DHL for you.' },
      { q: 'Do you ship to Puerto Rico and APO/FPO addresses?', a: 'Yes. We ship to all 50 states, Washington DC, Puerto Rico, the U.S. territories and military APO, FPO and DPO addresses.' },
    ],
    related: ['/shipping/ups', '/shipping/fedex', '/shipping/usps', '/shipping/packing'],
    cta: [{ label: 'Get domestic rates', href: '/ship', track: 'shipping_quote_start' }, { label: 'Call for a quote', href: 'tel', track: 'phone_click' }],
    status: 'published', updated: UPDATED,
    keywords: ['domestic shipping Monroe LA', 'ship a package Monroe'],
  },
  {
    category: 'shipping', slug: 'international', name: 'International shipping',
    h1: 'International shipping from Monroe, LA',
    title: 'International Shipping in Monroe, LA: DHL, UPS, FedEx & USPS',
    description: 'Ship internationally from Monroe, Louisiana. We help with carrier choice, customs forms and packing for DHL, UPS, FedEx and USPS international services.',
    intro: '{name} prepares international shipments at the counter. We help you choose between DHL, UPS, FedEx and USPS international services, fill in the customs paperwork, and pack the box so it holds up over a long trip.',
    sections: [
      { h: 'How an international shipment works here', list: [
        'Bring the items, unpacked if you like, and the full address and phone number of the person receiving them.',
        'We list what is inside, what it is worth and why you are sending it: the customs declaration every country asks for.',
        'You choose a carrier and speed from the quotes. Express services are faster and include tracking door to door.',
        'We pack, label and hand it to the carrier, and give you the tracking number.',
      ] },
      { h: 'Duties, taxes and restricted items', body: [
        'The destination country may charge import duties or taxes. Usually the receiver pays them on delivery. Every country restricts some items: batteries, liquids, perfume, food, medicine and cash are common examples. Tell us what you are sending and we will check the carrier\'s rules before you pay.',
      ] },
      { h: 'Booked in person or by phone', body: [
        'International shipments are quoted and booked at the counter or by phone at [{phone}](tel), so we can check the paperwork and the contents with you.',
      ] },
    ],
    restrictions: ['Every shipment needs a customs declaration with contents and value.', 'Prohibited and restricted items differ by country and carrier.', 'Duties and taxes are set by the destination country, not by us.'],
    pricing: 'International prices depend on the destination, weight, size and speed. We quote the carriers for your shipment before you pay.',
    providers: ['DHL', 'UPS', 'FedEx', 'USPS'],
    faqs: [
      { q: 'Which carrier is best for international shipping?', a: 'For time-sensitive shipments, express services from DHL, UPS or FedEx are the fastest and track door to door. For lighter, less urgent items, USPS international services can cost less. We quote the options for your box.' },
      { q: 'Do I need to fill out a customs form?', a: 'Yes. Every international shipment needs a description of the contents and their value. We help you complete it at the counter.' },
      { q: 'Who pays import duties?', a: 'Usually the receiver pays any duties or taxes the destination country charges, when the package is delivered.' },
      { q: 'Can I get an international quote online?', a: 'International quotes are given in person or by phone. Call {phone} or visit the counter.' },
    ],
    related: ['/shipping/vietnam', '/shipping/dhl', '/shipping/packing', '/guides/compare-ups-fedex-usps-dhl'],
    cta: [{ label: 'Call for an international quote', href: 'tel', track: 'phone_click' }, { label: 'Send us the details', href: '/contact', track: 'quote_request_click' }],
    status: 'published', updated: UPDATED,
    keywords: ['international shipping Monroe LA', 'DHL shipping Monroe LA'],
  },
  {
    category: 'shipping', slug: 'vietnam', name: 'Shipping to Vietnam',
    h1: 'Shipping packages and cargo to Vietnam from Louisiana',
    title: 'Ship Packages & Cargo to Vietnam from Monroe, Louisiana',
    description: 'Send boxes and gifts to family in Vietnam from Monroe, LA. Help with carrier choice, customs paperwork and sturdy packing. Open 7 days a week.',
    intro: 'Sending a box to family in Vietnam? {name} in Monroe helps you choose a service, fill in the customs declaration and pack it to survive the trip. Bring the items and the receiver\'s full Vietnamese address and phone number.',
    sections: [
      { h: 'What to bring', list: [
        'The receiver\'s full name, street address, ward, district, city or province, and a phone number in Vietnam.',
        'A list of what is in the box and roughly what each item is worth.',
        'Your own photo ID and phone number.',
      ] },
      { h: 'Choosing a service', body: [
        'Express services are the fastest and track the box to the door. Slower options can cost less for heavy boxes that are not urgent. Prices, transit times and size limits change, so we quote your box on the day. Call {phone} with the weight and size for an estimate.',
      ] },
      { h: 'Items to check before you pack', body: [
        'Vietnam customs and every carrier restrict some items. Common ones to ask about first: food and supplements, medicine, cosmetics and perfume, batteries and electronics, and cash or jewelry. Tell us what you plan to send and we will check before you pay.',
      ] },
      { h: 'Packing for a long trip', body: [
        'Boxes to Vietnam travel a long way and are handled many times. We use strong boxes, fill every gap, and seal and tape them for the trip. See [professional packing](/shipping/packing).',
      ] },
    ],
    restrictions: ['A customs declaration listing contents and value is required.', 'Vietnam and the carriers prohibit or restrict some items; we check before you pay.', 'Import duties or taxes may be charged to the receiver.'],
    pricing: 'Priced by weight, size and service on the day. Call or visit for a quote.',
    providers: ['DHL', 'UPS', 'FedEx', 'USPS'],
    faqs: [
      { q: 'How long does it take to ship a package to Vietnam?', a: 'It depends on the service. Express services are the fastest; economy options take longer. We give you the carrier\'s current estimate with the quote.' },
      { q: 'What address format does Vietnam use?', a: 'Include the receiver\'s full name, house number and street, ward (phường or xã), district (quận or huyện), city or province, and a Vietnamese phone number.' },
      { q: 'Can I send food or medicine to Vietnam?', a: 'Some food and medicine is restricted or prohibited. Tell us exactly what you want to send and we will check the rules before you pay.' },
      { q: 'Do you have staff who speak Vietnamese?', a: 'Our website can be read in Vietnamese from the language menu. Call {phone} to ask about help in Vietnamese at the counter.' },
    ],
    related: ['/shipping/international', '/shipping/packing', '/shipping/heavy-oversized', '/guides/compare-ups-fedex-usps-dhl'],
    cta: [{ label: 'Call for a Vietnam quote', href: 'tel', track: 'phone_click' }, { label: 'Send us the details', href: '/contact', track: 'quote_request_click' }],
    status: 'published', updated: UPDATED,
    keywords: ['shipping to Vietnam from Louisiana', 'Vietnam cargo shipping Monroe', 'gửi hàng về Việt Nam'],
    // The Vietnamese page is written; it stays a draft until a native speaker reviews it (issue 10).
    translations: { vi: {
      path: '/vi/gui-hang-di-viet-nam', status: 'draft', updated: UPDATED,
      name: 'Gửi hàng về Việt Nam',
      h1: 'Gửi hàng và thùng hàng về Việt Nam từ Louisiana',
      title: 'Gửi hàng về Việt Nam từ Monroe, Louisiana',
      description: 'Gửi thùng quà về gia đình ở Việt Nam từ Monroe, LA. Giúp chọn dịch vụ, khai hải quan và đóng gói chắc chắn. Mở cửa 7 ngày mỗi tuần.',
      intro: 'Bạn muốn gửi thùng hàng về gia đình ở Việt Nam? {name} tại Monroe giúp bạn chọn dịch vụ, điền tờ khai hải quan và đóng gói chắc chắn cho chuyến đi dài. Hãy mang theo hàng hóa và địa chỉ đầy đủ cùng số điện thoại của người nhận ở Việt Nam.',
      sections: [
        { h: 'Cần mang theo những gì', list: [
          'Họ tên người nhận, số nhà và tên đường, phường hoặc xã, quận hoặc huyện, tỉnh hoặc thành phố, và số điện thoại ở Việt Nam.',
          'Danh sách hàng trong thùng và giá trị ước tính của từng món.',
          'Giấy tờ tùy thân có ảnh và số điện thoại của bạn.',
        ] },
        { h: 'Chọn dịch vụ', body: [
          'Dịch vụ chuyển phát nhanh đến nơi sớm nhất và theo dõi được đến tận cửa. Các dịch vụ chậm hơn có thể rẻ hơn cho thùng nặng không gấp. Giá cước, thời gian và giới hạn kích thước thay đổi, nên chúng tôi báo giá theo thùng hàng của bạn vào ngày gửi. Gọi {phone} với cân nặng và kích thước để được báo giá.',
        ] },
        { h: 'Những món cần hỏi trước khi đóng gói', body: [
          'Hải quan Việt Nam và các hãng vận chuyển hạn chế một số mặt hàng. Hãy hỏi trước về: thực phẩm và thực phẩm chức năng, thuốc, mỹ phẩm và nước hoa, pin và đồ điện tử, tiền mặt hoặc trang sức. Cho chúng tôi biết bạn định gửi gì, chúng tôi sẽ kiểm tra trước khi bạn trả tiền.',
        ] },
        { h: 'Đóng gói cho chuyến đi dài', body: [
          'Thùng hàng về Việt Nam đi rất xa và qua tay nhiều lần. Chúng tôi dùng thùng chắc, chèn kín mọi khoảng trống, dán băng keo cẩn thận.',
        ] },
        { h: 'Giờ mở cửa và địa chỉ', body: [
          '{name}, {address}. Điện thoại: [{phone}](tel). {hoursSummaryVi}. Hàng gửi vào Thứ Bảy hoặc Chủ Nhật sẽ đi cùng chuyến lấy hàng kế tiếp của hãng vận chuyển.',
        ] },
      ],
      faqs: [
        { q: 'Gửi hàng về Việt Nam mất bao lâu?', a: 'Tùy dịch vụ. Chuyển phát nhanh là nhanh nhất; dịch vụ tiết kiệm lâu hơn. Chúng tôi cho bạn biết thời gian ước tính hiện tại của hãng khi báo giá.' },
        { q: 'Có gửi được thực phẩm hoặc thuốc về Việt Nam không?', a: 'Một số thực phẩm và thuốc bị hạn chế hoặc cấm. Hãy cho chúng tôi biết chính xác món bạn muốn gửi, chúng tôi sẽ kiểm tra quy định trước khi bạn trả tiền.' },
        { q: 'Ai trả thuế nhập khẩu?', a: 'Thường người nhận trả thuế hoặc phí nhập khẩu (nếu có) khi nhận hàng.' },
      ],
    } },
  },
  {
    category: 'shipping', slug: 'ups', name: 'UPS shipping',
    h1: 'UPS shipping in Monroe, LA',
    title: 'UPS Shipping in Monroe, LA: Ground, 2nd Day & Next Day',
    description: 'Ship UPS from {street} in Monroe. UPS Ground and air services, packing, and UPS return drop-offs. Open 7 days, weekdays until {weekdayClose}.',
    intro: 'Ship with UPS at {name}, {street}, Monroe. We quote UPS Ground and UPS air services next to the other carriers, pack the box, and hand it to UPS with your tracking number. We also take prepaid UPS packages and UPS returns.',
    sections: [
      { h: 'UPS services we quote', body: [
        'UPS Ground for everyday packages, and UPS air services such as 2nd Day Air and Next Day Air when it has to be there fast. UPS takes single packages up to 150 lb and 165 inches in length plus girth.',
      ] },
      { h: 'Compare before you choose', body: [
        'Because we ship with FedEx, USPS and DHL too, you see UPS\'s price beside the others. Sometimes UPS is best; sometimes another carrier is cheaper for the same box.',
        independent,
      ] },
      { h: 'Prepaid UPS labels and returns', body: [
        'Already have a UPS label? [Drop it off](/shipping/drop-off). Returning something with a UPS return label or QR code? See [returns](/shipping/returns). ' + weekendNote,
      ] },
    ],
    providers: ['UPS'],
    faqs: [
      { q: 'Can I ship UPS on Sunday in Monroe?', a: 'You can bring UPS packages to us on Sunday {sundayHours}. They leave with the next scheduled UPS pickup.' },
      { q: 'Is {name} a UPS Store?', a: 'No. We are an independent shipping store. We ship UPS along with FedEx, USPS and DHL.' },
      { q: 'What is the UPS weight limit?', a: 'UPS takes single packages up to 150 lb and up to 165 inches in length plus girth. Heavier shipments go as freight.' },
    ],
    related: ['/shipping/fedex', '/shipping/usps', '/shipping/drop-off', '/shipping/returns'],
    cta: [{ label: 'Compare UPS rates online', href: '/ship', track: 'shipping_quote_start' }],
    status: 'published', updated: UPDATED,
    keywords: ['UPS shipping Monroe LA', 'UPS drop off Monroe'],
  },
  {
    category: 'shipping', slug: 'fedex', name: 'FedEx shipping',
    h1: 'FedEx shipping in Monroe, LA',
    title: 'FedEx Shipping in Monroe, LA: Ground, Express & Drop-off',
    description: 'Ship FedEx from {street} in Monroe. FedEx Ground and Express rates beside UPS, USPS and DHL, plus packing and FedEx drop-offs. Open 7 days.',
    intro: 'Ship with FedEx at {name}, {street}, Monroe. We quote FedEx Ground and FedEx Express services next to the other carriers, pack your item, and hand it to FedEx. Prepaid FedEx packages and FedEx returns are welcome too.',
    sections: [
      { h: 'FedEx services we quote', body: [
        'FedEx Ground for cost-conscious shipping and FedEx Express services when speed matters. FedEx takes single packages up to 150 lb and 165 inches in length plus girth.',
      ] },
      { h: 'Compare before you choose', body: [
        'We put FedEx beside UPS, USPS and DHL so you pick the best price or the fastest arrival for each box.',
        independent,
      ] },
      { h: 'Prepaid FedEx labels and returns', body: [
        'Have a FedEx label already? [Drop it off](/shipping/drop-off). Sending a FedEx return? See [returns](/shipping/returns). ' + weekendNote,
      ] },
    ],
    providers: ['FedEx'],
    faqs: [
      { q: 'Where can I ship FedEx in Monroe after 5 PM?', a: 'At {name}, open until {weekdayClose} Monday through Friday.' },
      { q: 'Is this a FedEx Office?', a: 'No. We are an independent shipping store that ships FedEx along with UPS, USPS and DHL.' },
      { q: 'Can I drop off a prepaid FedEx package on the weekend?', a: 'Yes, Saturday {saturdayHours} and Sunday {sundayHours}. It leaves with the next scheduled FedEx pickup.' },
    ],
    related: ['/shipping/ups', '/shipping/usps', '/shipping/drop-off', '/shipping/returns'],
    cta: [{ label: 'Compare FedEx rates online', href: '/ship', track: 'shipping_quote_start' }],
    status: 'published', updated: UPDATED,
    keywords: ['FedEx shipping Monroe LA', 'FedEx drop off Monroe'],
  },
  {
    category: 'shipping', slug: 'usps', name: 'USPS shipping',
    h1: 'USPS shipping services in Monroe, LA',
    title: 'USPS Shipping in Monroe, LA: Priority Mail & Ground Advantage',
    description: 'Ship USPS Priority Mail, Ground Advantage and more at {street}, Monroe. Shorter lines, packing help, and open Sundays. Compare all carriers.',
    intro: 'Ship with USPS at {name} without the post office line. We quote USPS Priority Mail, Priority Mail Express and USPS Ground Advantage next to UPS, FedEx and DHL, pack your item, and hand it to the Postal Service.',
    sections: [
      { h: 'USPS services we quote', body: [
        'USPS Ground Advantage for light, everyday packages, Priority Mail for one-to-three-day delivery to most addresses, and Priority Mail Express when it must arrive fast. USPS takes packages up to 70 lb and 130 inches in length plus girth.',
      ] },
      { h: 'Open when the post office is closed', body: [
        'We are open Sunday {sundayHours} and weekdays until {weekdayClose}. ' + weekendNote,
        independent,
      ] },
    ],
    providers: ['USPS'],
    faqs: [
      { q: 'Can I mail a USPS package on Sunday in Monroe?', a: 'You can drop it off with us Sunday {sundayHours}. It goes out with the next scheduled USPS pickup.' },
      { q: 'Do you sell stamps or post office boxes?', a: 'We do not rent USPS PO Boxes. We rent private mailboxes with a real street address; see our mailbox page. Ask at the counter about stamps.' },
      { q: 'Is USPS cheaper than UPS or FedEx?', a: 'Often for light packages, but not always. We quote all carriers so you can compare.' },
    ],
    related: ['/shipping/ups', '/shipping/fedex', '/mailboxes', '/guides/private-mailbox-vs-po-box'],
    cta: [{ label: 'Compare USPS rates online', href: '/ship', track: 'shipping_quote_start' }],
    status: 'published', updated: UPDATED,
    keywords: ['USPS shipping services Monroe LA', 'Priority Mail Monroe'],
  },
  {
    category: 'shipping', slug: 'dhl', name: 'DHL shipping',
    h1: 'DHL shipping in Monroe, LA',
    title: 'DHL Shipping in Monroe, LA: International Express',
    description: 'Where to ship DHL in Monroe, LA: Goin\' Postal at {street}. DHL Express quotes, customs paperwork help and packing. Open 7 days a week.',
    intro: 'You can ship DHL at {name}, {street}, Monroe. DHL Express is built for international shipping; we quote it beside UPS, FedEx and USPS, help with the customs paperwork, and pack the box for the trip.',
    sections: [
      { h: 'When DHL makes sense', body: [
        'DHL Express is a strong choice for time-sensitive international shipments, with door-to-door tracking and customs handled by the carrier. For some destinations and weights another carrier is cheaper, so we quote them together.',
      ] },
      { h: 'What to bring', list: [
        'The receiver\'s full address and phone number.',
        'A list of the contents and their value for the customs declaration.',
        'Prepaid DHL shipments: the label or waybill, printed or on your phone.',
      ] },
      { h: 'Independent, not a DHL Service Point', body: [
        independent + ' ' + weekendNote,
      ] },
    ],
    providers: ['DHL'],
    faqs: [
      { q: 'Where can I ship a DHL package in Monroe?', a: 'At {name}, {street}. We quote DHL Express at the counter and help with the customs form.' },
      { q: 'Does DHL ship within the United States?', a: 'DHL Express focuses on international shipments. For packages within the U.S., we quote UPS, FedEx, USPS and the DHL options available for U.S. addresses online.' },
      { q: 'Can I drop off a DHL package that is already paid?', a: 'Yes. Bring the package with its label or waybill and we hand it to DHL at the next pickup.' },
    ],
    related: ['/shipping/international', '/shipping/vietnam', '/shipping/drop-off', '/guides/compare-ups-fedex-usps-dhl'],
    cta: [{ label: 'Call for a DHL quote', href: 'tel', track: 'phone_click' }],
    status: 'published', updated: UPDATED,
    keywords: ['DHL shipping Monroe LA', 'where can I ship a DHL package in Monroe'],
  },
  {
    category: 'shipping', slug: 'freight', name: 'Freight and pallet shipping',
    h1: 'Freight and pallet shipping in Monroe, LA',
    title: 'Freight & Pallet Shipping in Monroe, LA',
    description: 'Ship pallets, crates and freight from Monroe, Louisiana. Tell us the size, weight and ZIP codes and we will quote freight options. Call {phone}.',
    intro: 'When a shipment is too big or heavy for a parcel carrier, it ships as freight. {name} helps businesses and individuals in Monroe and Northeast Louisiana quote and book freight and pallet shipments.',
    sections: [
      { h: 'What we need for a freight quote', list: [
        'Pickup and delivery ZIP codes, and whether each end is a business or a home.',
        'The number of pallets or pieces, their dimensions and weight.',
        'What is being shipped, and whether it is fragile or needs special handling.',
        'Whether either end needs a liftgate, an appointment or inside delivery.',
      ] },
      { h: 'Getting a pallet ready', body: [
        'Freight travels best stacked square on a sound pallet, wrapped tight and labeled on more than one side. Nothing should hang over the pallet edges. Ask us how to prepare yours before pickup.',
      ] },
      { h: 'Freight or parcel?', body: [
        'Single boxes up to 150 lb usually ship cheaper as parcels. See [heavy and oversized shipping](/shipping/heavy-oversized). Several heavy boxes, or anything on a pallet, is usually freight.',
      ] },
    ],
    restrictions: ['Residential delivery, liftgates and appointments usually add charges.', 'Hazardous materials need special paperwork and may not be accepted.'],
    pricing: 'Freight is quoted per shipment from the size, weight, distance and services needed.',
    faqs: [
      { q: 'Can you ship a pallet from Monroe?', a: 'Yes. Call {phone} or send the pallet size, weight and ZIP codes on our contact page for a quote.' },
      { q: 'What is a liftgate and do I need one?', a: 'A liftgate lowers freight from the truck to the ground. You need one when there is no loading dock, which is typical for homes and small shops.' },
      { q: 'How heavy does a shipment have to be to go freight?', a: 'Single packages over 150 lb, or several heavy boxes going together, usually ship as freight.' },
    ],
    related: ['/shipping/heavy-oversized', '/shipping/packing', '/shipping', '/contact'],
    cta: [{ label: 'Request a freight quote', href: '/contact', track: 'quote_request_click' }, { label: 'Call us', href: 'tel', track: 'phone_click' }],
    status: 'published', updated: UPDATED,
    keywords: ['freight shipping Monroe LA', 'pallet shipping Monroe'],
  },
  {
    category: 'shipping', slug: 'heavy-oversized', name: 'Heavy and oversized items',
    h1: 'Shipping heavy and oversized items from Monroe, LA',
    title: 'Ship Heavy & Oversized Items in Monroe, LA',
    description: 'Ship large, heavy or awkward items from Monroe: furniture parts, equipment, tires, artwork. We measure, pack and compare carriers. Open 7 days a week.',
    intro: 'Big, heavy or oddly shaped? {name} measures it, packs it and finds the carrier that takes it for the least money. Single pieces up to 150 lb usually ship by UPS or FedEx; heavier shipments go as [freight](/shipping/freight).',
    sections: [
      { h: 'Why size matters as much as weight', body: [
        'Carriers charge large, light boxes by their size ("dimensional weight"), not just the scale. Very long or very large boxes also pay extra handling charges. Packing tight in the right size of box can save real money, and we measure before we quote.',
      ] },
      { h: 'Carrier limits for one package', table: {
        head: ['Carrier', 'Maximum weight', 'Maximum size'],
        rows: [['USPS', '70 lb', '130 in length plus girth'], ['UPS', '150 lb', '165 in length plus girth'], ['FedEx', '150 lb', '165 in length plus girth']],
      } },
      { h: 'Things people ship', list: ['Equipment and machine parts', 'Furniture pieces and boxed flat-pack', 'Artwork and framed mirrors (see [fragile shipping](/shipping/fragile))', 'Sporting goods, tires and wheels'] },
    ],
    pricing: 'Quoted by weight, size and distance. Large items often pay carrier surcharges, which we show in the quote.',
    faqs: [
      { q: 'What counts as an oversized package?', a: 'Each carrier sets its own thresholds, based on length and length plus girth. Large packages pay extra handling charges; we tell you before you pay.' },
      { q: 'Can you pack a large item for me?', a: 'Yes. We pack large and awkward items and can make a box to size when a stock box does not fit.' },
    ],
    related: ['/shipping/freight', '/shipping/packing', '/shipping/fragile', '/shipping/domestic'],
    cta: [{ label: 'Ask for a quote', href: '/contact', track: 'quote_request_click' }],
    status: 'published', updated: UPDATED,
    keywords: ['ship heavy items Monroe LA', 'oversized shipping Monroe'],
  },
  {
    category: 'shipping', slug: 'packing', name: 'Professional packing',
    h1: 'Professional packing and custom boxes in Monroe, LA',
    title: 'Packing Services & Custom Boxes in Monroe, LA',
    description: 'Bring it in loose. {name} packs, cushions and labels your item, and makes custom-size boxes when a stock box will not do. Open 7 days.',
    intro: 'Bring it in loose and leave it with us. {name} chooses the right box, cushions every side, seals it and labels it, so it arrives in one piece. When a stock box does not fit, we make one to size.',
    sections: [
      { h: 'How we pack', list: [
        'A strong box with room for cushioning on every side, not too big (carriers charge by size).',
        'Bubble, foam or paper so nothing shifts when the box is shaken.',
        'Items wrapped one by one, heavy things at the bottom.',
        'Sealed with packing tape on every seam, old labels removed.',
      ] },
      { h: 'Custom-size boxes', body: [
        'Long, flat or unusual items (art, mirrors, golf clubs, signs, parts) often need a box built to size. A snug custom box protects better and can cost less to ship than an oversized stock box.',
      ] },
      { h: 'Boxes and supplies', body: [
        'Packing yourself? We sell boxes, tape and cushioning. Ask at the counter.',
      ] },
    ],
    pricing: 'Packing is priced by the box size, materials and time. We tell you the price before we start.',
    faqs: [
      { q: 'Do I need to bring my own box?', a: 'No. Bring the item and we will supply the box and materials.' },
      { q: 'Can you pack something that does not fit a normal box?', a: 'Yes. We can make or cut down a box to fit long, flat or oddly shaped items.' },
      { q: 'Can I buy boxes and tape to pack at home?', a: 'Yes. Ask at the counter for boxes, tape and cushioning.' },
    ],
    related: ['/shipping/fragile', '/shipping/heavy-oversized', '/guides/how-to-package-a-shipment', '/shipping'],
    status: 'published', updated: UPDATED,
    keywords: ['professional packing Monroe LA', 'custom box packaging Monroe', 'pack and ship Monroe'],
  },
  {
    category: 'shipping', slug: 'fragile', name: 'Fragile item shipping',
    h1: 'Shipping fragile items from Monroe, LA',
    title: 'Ship Fragile Items in Monroe, LA: Glass, Art & Electronics',
    description: 'Ship glass, ceramics, art and electronics safely from Monroe. We wrap, double-box when needed and choose the right carrier. Open 7 days a week.',
    intro: 'Glassware, ceramics, framed art, electronics and heirlooms need more than a box and some paper. {name} wraps each piece, fills every gap and double-boxes when it is called for, then ships it with the carrier that suits it.',
    sections: [
      { h: 'How we pack fragile things', list: [
        'Each item wrapped on its own, corners and edges protected.',
        'At least two inches of cushioning between the item and every side of the box.',
        'Box-in-a-box for the most delicate pieces, so a knock on the outside never reaches the item.',
        'A shake test before we seal it: nothing should move.',
      ] },
      { h: 'Coverage', body: [
        'Ask about declaring a value when you ship. Carriers have their own rules for what they cover, especially for glass, art and antiques; we explain them before you pay.',
      ] },
    ],
    faqs: [
      { q: 'What is the safest way to ship something fragile?', a: 'Wrap each piece, cushion two inches on every side, and double-box anything delicate. We do this for you at the counter.' },
      { q: 'Does writing "Fragile" on the box help?', a: 'Not much. Packages are sorted by machines. Good packing is what protects the item.' },
      { q: 'Can I insure a fragile item?', a: 'You can declare a value with the carrier. Coverage rules differ by carrier and item type, and we explain them before you ship.' },
    ],
    related: ['/shipping/packing', '/shipping/heavy-oversized', '/guides/how-to-package-a-shipment', '/shipping/domestic'],
    status: 'published', updated: UPDATED,
    keywords: ['ship fragile items Monroe LA', 'how to ship fragile items'],
  },
  {
    category: 'shipping', slug: 'drop-off', name: 'Package drop-off',
    h1: 'Package drop-off in Monroe, LA, seven days a week',
    title: 'Package Drop-off in Monroe, LA: Prepaid UPS, FedEx & USPS',
    description: 'Drop off prepaid UPS, FedEx, USPS and DHL packages at {street}, Monroe. Open 7 days, weekdays until {weekdayClose}. We scan it in for your proof.',
    intro: 'Already have a label? Drop the package off at {name}, {street}, any day of the week. We take prepaid UPS, FedEx, USPS and DHL packages, scan them in so you have proof of drop-off, and hand them to the carrier at the next pickup.',
    sections: [
      { h: 'How drop-off works', list: [
        'Bring the sealed package with its label attached.',
        'We scan the barcode and record the drop-off.',
        'The package goes out with the carrier\'s next scheduled pickup.',
      ] },
      { h: 'Label on your phone?', body: [
        'If you have a QR code or an emailed label but no printer, we can [print the label](/shipping/label-printing) for you.',
      ] },
      { h: 'Weekend and evening drop-off', body: [
        'Open weekdays until {weekdayClose}, Saturday {saturdayHours} and Sunday {sundayHours}. ' + weekendNote,
      ] },
    ],
    providers: ['UPS', 'FedEx', 'USPS', 'DHL'],
    faqs: [
      { q: 'Where can I drop off a package on Sunday in Monroe?', a: 'At {name}, {street}, Sunday {sundayHours}. It leaves with the next scheduled carrier pickup.' },
      { q: 'Do you charge to drop off a prepaid package?', a: 'Ask at the counter. Packages with a prepaid label are scanned in and handed to the carrier.' },
      { q: 'Will I get a receipt?', a: 'We scan every drop-off in. Ask for a receipt when you hand it over.' },
    ],
    related: ['/shipping/returns', '/shipping/label-printing', '/shipping/ups', '/shipping/fedex'],
    status: 'published', updated: UPDATED,
    keywords: ['package drop off Monroe LA', 'prepaid label drop off', 'Saturday and Sunday package drop-off', 'shipping center open on Sunday'],
  },
  {
    category: 'shipping', slug: 'label-printing', name: 'Shipping label printing',
    h1: 'Print a shipping label in Monroe, LA',
    title: 'Print a Shipping Label in Monroe, LA: QR Codes & Emailed Labels',
    description: 'No printer? Bring the QR code or emailed label on your phone to {name} and we print and attach it. UPS, FedEx, USPS and DHL. Open 7 days.',
    intro: 'Got a shipping label in an email or a QR code on your phone but no printer? Bring the package to {name} and we print the label, attach it and send the package on its way.',
    sections: [
      { h: 'Ways to bring your label', list: [
        'A QR code or barcode on your phone from a retailer or carrier.',
        'A PDF label in your email.',
      ] },
      { h: 'Need a label too?', body: [
        'If you do not have a label yet, we sell you one at the counter after comparing UPS, FedEx, USPS and DHL for your package.',
      ] },
    ],
    faqs: [
      { q: 'Where can I print a shipping label near me in Monroe?', a: 'At {name}, {street}. Bring the QR code or emailed label and the package.' },
      { q: 'Can you print an Amazon return QR code?', a: 'Bring the return QR code or label on your phone and we will help you send it. See our returns page.' },
    ],
    related: ['/shipping/returns', '/shipping/drop-off', '/guides/where-to-print-shipping-labels', '/shipping/domestic'],
    status: 'published', updated: UPDATED,
    keywords: ['print shipping label Monroe LA', 'where to print shipping labels'],
  },
  {
    category: 'shipping', slug: 'returns', name: 'Returns drop-off',
    h1: 'Return online purchases in Monroe, LA',
    title: 'E-commerce Returns in Monroe, LA: Amazon, UPS, FedEx & USPS',
    description: 'Return online orders at {name}. We print the label from your phone, box the item and scan it in so you have proof. Open 7 days a week.',
    intro: 'Returning something you bought online? Bring it to {name} with the return label or QR code on your phone. We print the label, box the item if it needs it, and scan it in so you have proof it was handed over.',
    sections: [
      { h: 'Returns we help with', body: [
        'Returns from Amazon and other online stores that come with a prepaid UPS, FedEx or USPS label or QR code. Check your retailer\'s return instructions to see which carrier it uses.',
      ] },
      { h: 'No box? No problem', body: [
        'If the original box is gone, we can [pack it](/shipping/packing) for you.',
      ] },
      { h: 'Business returns', onlineOnly: true, body: [
        'Online sellers with a PeterShip business account can give customers a prepaid return link. See [PeterShip for sellers](/petership).',
      ] },
    ],
    faqs: [
      { q: 'Can I return an Amazon package at {name}?', a: 'If your Amazon return gives you a UPS, FedEx or USPS label or QR code, bring it here and we will send it. Some Amazon return options are only accepted at specific stores; check your return instructions.' },
      { q: 'Do I need to box my return?', a: 'If you have no box, we can pack it for you for a small charge.' },
      { q: 'Can I drop off a return on the weekend?', a: 'Yes, Saturday {saturdayHours} and Sunday {sundayHours}. It leaves with the next scheduled carrier pickup.' },
    ],
    related: ['/shipping/drop-off', '/shipping/label-printing', '/shipping/packing', '/guides/how-to-return-online-purchases'],
    status: 'published', updated: UPDATED,
    keywords: ['e-commerce returns Monroe LA', 'Amazon returns Monroe'],
  },

  // ============================================================== MAILBOXES
  {
    category: 'mailboxes', slug: '', name: 'Mailboxes',
    h1: 'Mailbox rental in Monroe, LA',
    title: 'Mailbox Rental in Monroe, LA: Physical & Virtual Mailboxes',
    description: 'Rent a private mailbox with a real street address in Monroe, or a virtual mailbox you manage online. Packages from every carrier. {street}.',
    intro: '{name} rents two kinds of mailbox: a **physical mailbox** on our wall that you pick up from in person, and a **virtual mailbox** you manage online. Both give you a real street address at {street}, not a PO Box, and both accept packages from every carrier.',
    sections: [
      { h: 'Physical or virtual?', table: {
        caption: 'The two mailbox services side by side.',
        head: ['', 'Physical mailbox', 'Virtual mailbox'],
        rows: [
          ['Address', 'Street address with your box number', 'Street address with your mailbox number'],
          ['Getting your mail', 'Pick up in person during store hours', 'See your mail online; ask for scans, forwarding or shredding'],
          ['Packages', 'Accepted from every carrier, held for you', 'Accepted and logged; forward or pick up'],
          ['Best for', 'People who live or work nearby', 'Travelers, remote workers and businesses outside Monroe'],
          ['Sign-up', 'At the counter with two IDs and USPS Form 1583', 'Online through Anytime Mailbox, with USPS Form 1583'],
        ],
      } },
      { h: 'Which one is right for you?', body: [
        'Pick up your mail in Monroe each week? A [physical mailbox](/mailboxes/physical) is simple. Away often, or running a business from somewhere else? A [virtual mailbox](/mailboxes/virtual) lets you see each piece of mail online. Need an address for a business? See [business mailing addresses](/mailboxes/business-address). Our guide [physical vs. virtual mailboxes](/guides/physical-vs-virtual-mailbox) goes into more detail.',
      ] },
    ],
    faqs: [
      { q: 'Is a private mailbox the same as a PO Box?', a: 'No. A private mailbox at our store uses our street address with your box number, and it accepts packages from UPS, FedEx and DHL as well as USPS. A USPS PO Box is at the post office and many private carriers cannot deliver to it.' },
      { q: 'What do I need to rent a mailbox?', a: 'Two forms of ID, one with your photo, and a signed USPS Form 1583, which authorizes us to receive mail for you.' },
      { q: 'Can I get my mail on the weekend?', a: 'Physical mailbox holders can pick up during store hours, including Saturday {saturdayHours} and Sunday {sundayHours}.' },
    ],
    related: ['/mailboxes/physical', '/mailboxes/virtual', '/mailboxes/business-address', '/guides/private-mailbox-vs-po-box'],
    cta: [{ label: 'Call about a mailbox', href: 'tel', track: 'phone_click' }],
    status: 'published', updated: UPDATED,
    keywords: ['mailbox rentals Monroe LA', 'private mailbox Monroe'],
  },
  {
    category: 'mailboxes', slug: 'physical', name: 'Physical mailbox rental',
    h1: 'Private physical mailbox rental in Monroe, LA',
    title: 'Private Mailbox Rental in Monroe, LA: Street Address & Packages',
    description: 'Rent a private mailbox at {street}, Monroe: a real street address, packages from every carrier, and pickup 7 days a week. Small, medium, large.',
    intro: 'A private mailbox at {name} gives you a real street address, {street} #your box number, Monroe, LA. We accept your letters and packages from USPS, UPS, FedEx and DHL and keep them safe until you pick them up, seven days a week.',
    sections: [
      { h: 'What you get', list: [
        'A street address, not a PO Box, that you can use for personal mail and online orders.',
        'Packages accepted from every carrier and held for you.',
        'Pickup during store hours, including weekday evenings until {weekdayClose} and weekends.',
        'Small, medium and large box sizes.',
        'Six-month or yearly terms.',
      ] },
      { h: 'How to sign up', list: [
        'Come to the counter with two current forms of ID. One must have your photo; one must show your address.',
        'Sign USPS Form 1583, which authorizes us to receive mail for you. We witness it at the counter.',
        'Pay for the first term and get your box and key.',
      ] },
      { h: 'Your address format', body: [
        'Mail to your box is addressed to your name, then {street} #box number, then Monroe, LA 71201. USPS rules require the box number with "#" or "PMB".',
      ] },
    ],
    pricing: 'Prices depend on the box size and term. Call {phone} or ask at the counter for current prices.',
    restrictions: ['USPS requires two forms of ID and a signed Form 1583 before we can accept mail for you.'],
    faqs: [
      { q: 'Can I receive Amazon and UPS packages at my mailbox?', a: 'Yes. Packages from every carrier are accepted and held for you.' },
      { q: 'How long are the rental terms?', a: 'Six months or a year.' },
      { q: 'Can someone else pick up my mail?', a: 'Anyone who will receive mail at the box must be listed on the Form 1583. Ask at the counter about adding people.' },
      { q: 'Is my mailbox address a real street address?', a: 'Yes. Your address is our street address with your box number, which works where a PO Box is not accepted.' },
    ],
    related: ['/mailboxes', '/mailboxes/virtual', '/mailboxes/mail-forwarding', '/guides/private-mailbox-vs-po-box'],
    cta: [{ label: 'Call about box sizes and prices', href: 'tel', track: 'mailbox_inquiry' }],
    status: 'published', updated: UPDATED,
    keywords: ['personal mailbox rental Monroe LA', 'package receiving Monroe', 'private mailbox Monroe'],
  },
  {
    category: 'mailboxes', slug: 'virtual', name: 'Virtual mailbox',
    h1: 'Virtual mailbox in Monroe, LA',
    title: 'Virtual Mailbox in Monroe, LA: See and Manage Your Mail Online',
    description: 'A virtual mailbox at {street}, Monroe: a real street address, mail you can see online, and requests to scan, forward or shred. Via Anytime Mailbox.',
    intro: 'A virtual mailbox at {name} gives you our street address in Monroe and lets you manage your mail online from anywhere. Our virtual mailboxes run on **Anytime Mailbox**: you sign up and manage everything in their app, and we receive and handle your mail here at the store.',
    sections: [
      { h: 'What a virtual mailbox does', list: [
        'You see an image of the outside of each envelope as it arrives.',
        'You choose what happens next: open and scan, forward, hold for pickup or shred.',
        'Packages are received and logged for you.',
      ] },
      { h: 'Who uses one', body: [
        'Frequent travelers, RV owners, remote workers and businesses that need a Monroe address but are not here every week. If you are in Monroe and like collecting mail in person, a [physical mailbox](/mailboxes/physical) may suit you better.',
      ] },
      { h: 'How to sign up', body: [
        'Choose our Monroe location in Anytime Mailbox and pick a plan. Features and prices are set by the plan you choose. USPS Form 1583 is required for every mailbox; Anytime Mailbox walks you through it.',
      ] },
    ],
    providers: ['Anytime Mailbox'],
    pricing: 'Plans and prices are listed in Anytime Mailbox when you choose our location.',
    faqs: [
      { q: 'What is the difference between a virtual and a physical mailbox?', a: 'With a physical mailbox you collect your mail at the store. With a virtual mailbox you see your mail online and ask for it to be scanned, forwarded or shredded.' },
      { q: 'Do I have to live in Monroe to have a virtual mailbox here?', a: 'No. A virtual mailbox is managed online, so you can be anywhere.' },
      { q: 'Can I switch from a virtual mailbox to a physical one?', a: 'Yes. Sign up for a physical box at the counter; it needs its own Form 1583 with the new box number.' },
    ],
    related: ['/mailboxes', '/mailboxes/physical', '/mailboxes/mail-forwarding', '/guides/physical-vs-virtual-mailbox'],
    // The sign-up button appears once profiles.anytimeMailbox (src/data/store.ts) holds the store's Anytime Mailbox page.
    cta: [{ label: 'Sign up online', href: 'anytimeMailbox', track: 'virtual_mailbox_signup' }, { label: 'Ask about virtual mailboxes', href: 'tel', track: 'virtual_mailbox_inquiry' }],
    status: 'published', updated: UPDATED,
    keywords: ['virtual mailbox Monroe LA', 'virtual business address Monroe'],
  },
  {
    category: 'mailboxes', slug: 'business-address', name: 'Business mailing address',
    h1: 'Business mailing address in Monroe, LA',
    title: 'Business Mailing Address in Monroe, LA for Small Businesses',
    description: 'Get a professional street address for your business at {street}, Monroe. Keep your home address private, receive packages from every carrier.',
    intro: 'A mailbox at {name} gives your business a professional street address in Monroe, so you can keep your home address off your website, invoices and listings. Choose a [physical mailbox](/mailboxes/physical) to collect in person, or a [virtual mailbox](/mailboxes/virtual) to manage your mail online.',
    sections: [
      { h: 'Why small businesses use one', list: [
        'Privacy: your home address stays off public records you control, like your website and invoices.',
        'A street address, which many suppliers and carriers prefer to a PO Box.',
        'Packages from UPS, FedEx, DHL and USPS received while you are out.',
        'Someone here to sign for deliveries during store hours, seven days a week.',
      ] },
      { h: 'What it does not replace', body: [
        'A mailbox address is a mailing address. Some registrations, such as a registered agent for an LLC, have their own rules. Check what your filing requires before you use any mailbox address on it.',
      ] },
      { h: 'Ship from the same place', body: [
        'Many mailbox holders ship from here too: drop off, pack and send from the same counter where you collect your mail. See [shipping](/shipping).',
      ] },
    ],
    faqs: [
      { q: 'Can I use a mailbox address for my business?', a: 'Yes, as a mailing address for mail and packages. Check the rules before using it for registrations that need a physical office or registered agent.' },
      { q: 'How do I get a business mailing address in Monroe?', a: 'Rent a physical or virtual mailbox at {name}. You need two IDs and a USPS Form 1583 that names the business.' },
      { q: 'Can several people at my business receive mail at one box?', a: 'Each person and the business must be listed on the Form 1583. Ask at the counter.' },
    ],
    related: ['/mailboxes/physical', '/mailboxes/virtual', '/guides/how-to-get-a-business-mailing-address', '/shop/business-cards'],
    status: 'published', updated: UPDATED,
    keywords: ['business mailing address Monroe LA', 'small business mailbox Monroe'],
  },
  {
    category: 'mailboxes', slug: 'mail-forwarding', name: 'Mail forwarding',
    h1: 'Mail forwarding from Monroe, LA',
    title: 'Mail Forwarding in Monroe, LA for Mailbox Holders',
    description: 'Away from Monroe? Mailbox holders at Goin\' Postal can have mail and packages forwarded to them. Virtual mailbox holders request it online.',
    intro: 'Mailbox holders at {name} can have their mail and packages sent on to wherever they are. Virtual mailbox holders request forwarding in the Anytime Mailbox app; physical mailbox holders arrange it at the counter or by phone.',
    sections: [
      { h: 'How forwarding works', list: [
        'Tell us where to send it and which items, or forward everything on a schedule.',
        'We pack it and ship it with the carrier that fits.',
        'You pay the postage and a handling charge, and get a tracking number.',
      ] },
      { h: 'Not the same as USPS mail forwarding', body: [
        'USPS change-of-address forwarding sends mail from your old home address. Our forwarding is for mail that arrives at your mailbox here.',
      ] },
    ],
    pricing: 'Postage plus a handling charge. Ask at the counter, or see your plan in Anytime Mailbox.',
    faqs: [
      { q: 'Can you forward my mail while I travel?', a: 'Yes, if you rent a mailbox with us. Tell us where to send it.' },
      { q: 'Can you forward packages too?', a: 'Yes. Packages are forwarded with tracking.' },
    ],
    related: ['/mailboxes/virtual', '/mailboxes/physical', '/mailboxes', '/guides/physical-vs-virtual-mailbox'],
    status: 'published', updated: UPDATED,
    keywords: ['mail forwarding Monroe LA'],
  },

  // ============================================================== BUSINESS SERVICES
  {
    category: 'business-services', slug: '', name: 'Business services',
    h1: 'Business services in Monroe, LA',
    title: 'Business Services in Monroe, LA: Notary, Printing, Fax & More',
    description: 'Notary, fingerprinting, printing and copies, faxing, scanning and shredding at {street}, Monroe. One stop, open 7 days a week.',
    intro: 'Besides shipping and mailboxes, {name} handles the office errands that pile up: [notary](/business-services/notary), [fingerprinting](/business-services/fingerprinting), [printing and copies](/business-services/printing), [faxing](/business-services/fax), [scanning](/business-services/scanning) and [document shredding](/business-services/shredding), all at one counter on Forsythe Ave.',
    sections: [
      { h: 'Business products', body: [
        'Design and order [business cards online](/shop/business-cards) and pick them up here.',
      ] },
    ],
    faqs: [
      { q: 'Do you offer notary services?', a: 'Yes. Our notary is on call: phone ahead at {phone} and we will have one here when you arrive.' },
      { q: 'Can I print documents from my phone?', a: 'Yes. Send them to us or bring them on a USB drive or phone and we will print them.' },
    ],
    related: ['/business-services/notary', '/business-services/printing', '/business-services/shredding', '/shop/business-cards'],
    status: 'published', updated: UPDATED,
  },
  {
    category: 'business-services', slug: 'notary', name: 'Notary',
    h1: 'Notary services in Monroe, LA',
    title: 'Notary Near Me in Monroe, LA: Call Ahead for a Notary',
    description: 'Need a notary in Monroe? Call Goin\' Postal at {phone} and we will have a notary here when you arrive. Bring your unsigned document and photo ID.',
    intro: 'Need a document notarized in Monroe? {name} has a notary on call. **Phone ahead at [{phone}](tel)** and we will arrange for a notary to be here when you arrive.',
    sections: [
      { h: 'What to bring', list: [
        'The document, not yet signed. You sign it in front of the notary.',
        'A current government-issued photo ID for every person signing.',
        'Every signer, in person.',
        'Any witnesses your document needs (ask us when you call).',
      ] },
      { h: 'What a notary can and cannot do', body: [
        'A notary confirms who is signing and watches them sign. A notary does not give legal advice or tell you which form to use. If you are not sure what your document needs, ask the office or attorney who gave it to you.',
      ] },
    ],
    pricing: 'Ask when you call; the fee depends on the document and number of signatures.',
    faqs: [
      { q: 'Do I need an appointment for a notary?', a: 'Please call ahead at {phone} so we can have a notary here when you arrive.' },
      { q: 'Should I sign my document before I come in?', a: 'No. Sign it in front of the notary.' },
      { q: 'What ID do I need for notarization?', a: 'A current, government-issued photo ID, such as a driver\'s license or passport, for every signer.' },
    ],
    related: ['/business-services/printing', '/business-services/fax', '/business-services/scanning', '/business-services'],
    cta: [{ label: 'Call to schedule a notary', href: 'tel', track: 'phone_click' }],
    status: 'published', updated: UPDATED,
    keywords: ['notary near me', 'notary Monroe LA'],
  },
  {
    category: 'business-services', slug: 'fingerprinting', name: 'Fingerprinting',
    h1: 'Fingerprinting in Monroe, LA',
    title: 'Fingerprinting in Monroe, LA: Call Ahead to Confirm',
    description: 'Fingerprinting for jobs, licenses and background checks in Monroe, LA. Call {phone} first so we can confirm the type your agency requires.',
    intro: 'Need fingerprints for a job, license or background check? {name} offers fingerprinting in Monroe. Agencies ask for different kinds of fingerprints, so **call [{phone}](tel) first** and tell us what your agency sent you.',
    sections: [
      { h: 'Before you come in', list: [
        'Read the instructions from the agency or employer asking for your fingerprints: they say which card or system to use.',
        'Call us with those instructions so we can confirm we can do that type.',
        'Bring the fingerprint card your agency gave you, if they gave you one.',
        'Bring a current government-issued photo ID.',
      ] },
      { h: 'Tips for clear prints', body: [
        'Wash and dry your hands before you come. Avoid lotion that day. Very dry or worn fingertips can be harder to print; let us know and we will take our time.',
      ] },
    ],
    pricing: 'Ask when you call; the price depends on the type of fingerprinting.',
    faqs: [
      { q: 'Where can I get fingerprinted in Monroe?', a: 'At {name}, {street}. Call {phone} first so we can confirm we can do the type your agency requires.' },
      { q: 'What do I need to bring for fingerprinting?', a: 'A current photo ID, your agency\'s instructions, and the fingerprint card if they gave you one.' },
    ],
    related: ['/business-services/notary', '/business-services/scanning', '/business-services/fax', '/guides/how-to-get-fingerprinted'],
    cta: [{ label: 'Call before you come', href: 'tel', track: 'phone_click' }],
    status: 'published', updated: UPDATED,
    keywords: ['fingerprinting Monroe LA'],
  },
  {
    category: 'business-services', slug: 'shredding', name: 'Document shredding',
    h1: 'Document shredding in Monroe, LA',
    title: 'Document Shredding in Monroe, LA: Drop Off by the Pound',
    description: 'Secure document shredding in Monroe. Drop off a bag or a box of papers at {street}; priced by the pound. Open 7 days a week.',
    intro: 'Old bank statements, tax papers, medical bills, anything with an account number: drop it off at {name} and we shred it. Bring a bag or a box; shredding is priced **by the pound**.',
    sections: [
      { h: 'What to shred', list: ['Bank and credit card statements', 'Old tax returns and pay stubs past the time you need to keep them', 'Medical and insurance paperwork', 'Pre-approved credit offers and anything with your Social Security number'] },
      { h: 'How it works', body: [
        'Bring the papers in a bag or box. We weigh them, you pay by the pound, and the papers are shredded. Staples and paper clips are fine for most loads; ask if you have binders or folders.',
      ] },
    ],
    pricing: 'Priced by the pound. Ask at the counter for the current rate.',
    faqs: [
      { q: 'Where can I shred documents in Monroe?', a: 'At {name}, {street}. Drop off a bag or box; shredding is priced by the pound.' },
      { q: 'Do I need to remove staples?', a: 'Usually not. Ask about binder clips, binders and folders.' },
    ],
    related: ['/business-services/scanning', '/business-services/printing', '/mailboxes/virtual', '/business-services'],
    status: 'published', updated: UPDATED,
    keywords: ['document shredding Monroe LA'],
  },
  {
    category: 'business-services', slug: 'fax', name: 'Fax services',
    h1: 'Fax services in Monroe, LA',
    title: 'Send a Fax in Monroe, LA: Fax Services',
    description: 'Send a fax in Monroe at Goin\' Postal, {street}. Bring your pages and the fax number. Open weekdays until {weekdayClose} and on weekends.',
    intro: 'Need to send a fax? Bring your pages and the receiving fax number to {name} on Forsythe Ave and we will send it for you, with a confirmation that it went through.',
    sections: [
      { h: 'What to bring', list: ['The pages to send, or the file on your phone or a USB drive (we can print it first).', 'The full fax number, with area code.', 'A cover sheet if the receiver asked for one; we can help you make one.'] },
      { h: 'Faxing to offices', body: [
        'Doctors\' offices, insurers, courts and government offices still ask for faxes. Ask for the confirmation page and keep it as your proof of sending.',
      ] },
    ],
    pricing: 'Priced per page. Ask at the counter.',
    faqs: [
      { q: 'Where can I send a fax in Monroe?', a: 'At {name}, {street}. We send it for you and give you the confirmation.' },
      { q: 'Can you fax something from my phone?', a: 'Yes. We print it from your phone or email first, then fax it.' },
    ],
    related: ['/business-services/printing', '/business-services/scanning', '/business-services/notary', '/guides/how-to-send-a-fax'],
    status: 'published', updated: UPDATED,
    keywords: ['fax services Monroe LA', 'send a fax Monroe'],
  },
  {
    category: 'business-services', slug: 'printing', name: 'Printing and copies',
    h1: 'Printing and copying services in Monroe, LA',
    title: 'Printing & Copies in Monroe, LA: Documents, Flyers & Banners',
    description: 'Document printing and copies, flyers and banners in Monroe, often the same day. Print from your phone, email or USB. Order business cards online.',
    intro: '{name} prints and copies documents, flyers and banners, often the same day. Bring the file on your phone or a USB drive, or send it ahead, and we print it. For business cards, [design and order online](/shop/business-cards).',
    sections: [
      { h: 'What we print', list: ['Black-and-white and color documents', 'Copies of forms, manuals and handouts', 'Flyers and posters', 'Banners', '[Business cards](/shop/business-cards), designed online and picked up here'] },
      { h: 'Sending your file', body: [
        'PDF is the safest format: it prints exactly as you see it. Phone photos of documents print too; we can help straighten and clean them up. Call {phone} to ask how to send a file ahead.',
      ] },
    ],
    pricing: 'Priced per page or per piece, depending on size, color and paper. Ask at the counter.',
    faqs: [
      { q: 'Can I print from my phone?', a: 'Yes. Bring it on your phone, email it, or bring a USB drive.' },
      { q: 'Do you print banners?', a: 'Yes. Ask at the counter about sizes and timing.' },
      { q: 'How fast can I get copies?', a: 'Everyday printing and copies are often done the same day. Larger jobs depend on size; ask when you order.' },
    ],
    related: ['/shop/business-cards', '/business-services/scanning', '/business-services/fax', '/business-services'],
    cta: [{ label: 'Design business cards', href: '/shop/business-cards', track: 'cards_cta' }],
    status: 'published', updated: UPDATED,
    keywords: ['printing services Monroe LA', 'copies Monroe', 'document printing Monroe'],
  },
  {
    category: 'business-services', slug: 'scanning', name: 'Scanning',
    h1: 'Document scanning in Monroe, LA',
    title: 'Document Scanning in Monroe, LA: Scan to Email or USB',
    description: 'Scan documents and photos to PDF in Monroe at Goin\' Postal, {street}. Sent to your email or saved to a USB drive. Open 7 days a week.',
    intro: 'Need a paper document as a file? {name} scans documents to PDF and sends them to your email or saves them to your USB drive, so you can upload them to a job application, an insurer or a government website.',
    sections: [
      { h: 'Common scanning jobs', list: ['Forms and signed documents for online applications', 'Receipts and records for your files', 'ID copies and supporting documents (we never keep a copy)'] },
      { h: 'Paperwork you no longer need', body: [
        'Once the papers are scanned, we can [shred](/business-services/shredding) the originals you do not need to keep.',
      ] },
    ],
    pricing: 'Priced per page. Ask at the counter.',
    faqs: [
      { q: 'Can you scan a document and email it to me?', a: 'Yes. We scan to PDF and email it to you, or save it to your USB drive.' },
      { q: 'Do you keep a copy of what you scan?', a: 'No. Files are sent to you and not kept.' },
    ],
    related: ['/business-services/fax', '/business-services/printing', '/business-services/shredding', '/business-services'],
    status: 'published', updated: UPDATED,
    keywords: ['scanning services Monroe LA'],
  },
];

export const publishedServices = (all = SERVICES) => all.filter((s) => s.status === 'published');
export const servicesIn = (category: ServiceEntry['category'], all = SERVICES) => all.filter((s) => s.category === category && s.slug);
export const hubFor = (category: ServiceEntry['category'], all = SERVICES) => all.find((s) => s.category === category && !s.slug);
export const CATEGORY_NAMES: Record<ServiceEntry['category'], string> = { shipping: 'Shipping', mailboxes: 'Mailboxes', 'business-services': 'Business services' };
