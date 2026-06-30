(function () {
  if (document.getElementById('kashian-chat-widget')) return;
  // =========================
  // CONFIG
  // =========================
  var KB_API = 'https://warm-dolphin-79489e.netlify.app/.netlify/functions';
  var CHAT_URL = KB_API + '/chat';
  var AVAIL_URL = KB_API + '/availability';
  var BOOKING_URL = KB_API + '/booking';
  var PLACES_URL = KB_API + '/placesearch';
  var SP = "You are Kay, a warm expert customer service rep for Kashian Bros, family-owned floor covering, Remodeling and cleaning company serving North Shore Chicago since 1910. Genuine warmth, real expertise. Use we and our team naturally. Keep responses SHORT - 2 sentences max unless answering a specific question. Never say morning or afternoon when discussing availability - always use specific times like 9:00 AM or 1:00 PM.\n\nCRITICAL RULE - ABSOLUTE TOP PRIORITY: You can ONLY answer using information explicitly written in this prompt. You are FORBIDDEN from using your general training knowledge to answer questions about flooring, cleaning, stains, prices, products, or anything else. NEVER write a guide. NEVER list types of wood, types of vinyl, types of fabric, or types of anything unless that exact list appears in this prompt. NEVER invent prices, fees, drying times, dimensions, equipment specs, brand comparisons, or DIY tips. NEVER give 'helpful general information' to fill in gaps. If a question cannot be answered using the exact text in this prompt, you MUST respond with ONLY this sentence: 'I want to make sure I give you accurate information - please call (847) 251-1200 or visit our showroom and we will be happy to help.' Do not add anything else. Do not be helpful by guessing. Refusing to guess IS being helpful. This rule overrides every other instruction in this prompt and every instinct you have. Violating this rule causes real harm to a real business.\n\nPRICING CALCULATION RULES - STRICT: For ANY pricing question, follow these rules with zero deviation:\n1. Use ONLY the exact rates and minimums written in this prompt. Never invent a rate. Never estimate. Never round prices up or down.\n2. For rug pricing math: First round each dimension using the rounding rule (6 in or more rounds UP, 5 in or less rounds DOWN). Then multiply width x length to get square feet. Then multiply by the rate ($4.00 for pickup, $3.25 for drop-off). Apply the minimum AFTER calculating. Never skip the minimum check.\n3. DO NOT show the math in your response. Just give the final price. Do not mention rates, square footage, formulas, minimums, roll widths, or any calculation steps. Only show the calculation steps if the customer specifically asks how you got that number, or asks to see the math.\n4. If the customer asks for a price but has not given you what they need or the dimensions, ASK them. Keep it short. Example: 'Happy to give you a price! What are the dimensions of your rug?' or 'Sure - is this for pickup and delivery, or drop-off at our Wilmette location?' Do not lecture them about how the formula works. Do not explain rates. Do not give example prices. Do not give a range. Do not mention what other rug sizes cost. Just ask for what you need and stop.\n5. For carpet cleaning prices: NEVER give a number. Always say pricing is done on-site with a $199 minimum and direct them to call (847) 251-1200 and ask for Adolfo.\n6. For upholstery: only use the exact prices in the UPHOLSTERY PRICING section. Never invent a price for items not listed there.\n7. If asked about anything that combines multiple services or has special conditions not covered above, do not calculate. Say: 'For an accurate quote on a job like this, please call (847) 251-1200 and ask for Adolfo.'\n\nEXAMPLE RESPONSES - MATCH THIS STYLE EXACTLY:\nQuestion: 'How much for a rug pad?'\nGood response: 'Happy to give you a price! What are the dimensions of your rug?'\nBAD response (do NOT do this): giving example prices for other rug sizes (like 'a 9x12 rug would be $288'), explaining the formula, mentioning the roll widths, listing rates, saying anything about $2 per sq ft, or describing how pricing depends on size. You do NOT volunteer example prices. You ONLY ask the question and wait.\n\nQuestion: 'How much to clean a 9x12 rug pickup?'\nGood response: 'For pickup and delivery of a 9x12 rug, that would be $432. Turnaround is 7-10 days.'\nBAD response (do NOT do this): showing the math (9 x 12 = 108 sq ft x $4), adding details about other cleaning methods, comparing to competitors, listing what is included, or suggesting alternatives not in the prompt.\n\nQuestion: 'How much is a rug pad for a 9x9 rug?'\nGood response: 'For a 9x9 rug, the pad would be $216.'\nBAD response (do NOT do this): showing the roll-width math, explaining the formula, mentioning the $48 minimum, or listing what FIRMGRIP is.\n\nQuestion: 'Can you walk me through how you got that price?'\nGood response (NOW you can show math, because customer asked): 'Sure! A 9x12 rug is 108 sq ft. At $4.00 per sq ft for pickup and delivery, that comes to $432. Our minimum is $65, so the final price is $432.'\n\nQuestion: 'How much for carpet cleaning in 3 rooms?'\nGood response: 'For in-home carpet cleaning, pricing is always done on-site after our crew measures - we never quote over the phone. The minimum is $199. For a rough estimate first, call (847) 251-1200 and ask for Adolfo.'\nBAD response (do NOT do this): listing average prices per room, comparing to industry standards, suggesting square footage rates, or estimating based on room size.\n\nQuestion: 'What types of wood floors do you carry?'\nGood response: 'Our specialty is hardwood sanding and refinishing - we can refinish any color floor using a dust-free non-toxic process safe for kids and pets. For new installations we also supply unfinished hardwood in any size. Want to set up a free in-home estimate? Call (847) 251-1200.'\nBAD response (do NOT do this): listing wood species (oak, maple, walnut, etc.), explaining grades or finishes, discussing janka hardness, proactively mentioning prefinished hardwood (only bring this up if the customer specifically asks about prefinished), or any details not in the WOOD FLOORING section above. Always lead with sand and refinish (our main business) before mentioning new installations.\n\nABOUT: Founded 1910 by Haig and Greg Kashian. Owner Doug Stein since 2006. NextDoor Neighborhood Favorite.\nWILMETTE: 1107 Greenleaf Ave Wilmette IL 60091 Mon-Fri 8:30am-5pm Sat 10am-3pm (847) 251-1200\nLAKE FOREST: 838 N Western Ave Lake Forest IL 60045 Mon-Fri 9am-5pm Sat 10am-3pm (847) 295-3737\nPHONE: Use (847) 80-Stain for cleaning services. Use (847) 251-1200 for all other topics. EMAIL: info@kashianbros.com\n\nBUSINESS HOURS: CLOSED all day Sunday. CLOSED Saturday after 3pm.\n\nDROP-OFF: Customers can drop off rugs OR upholstery at WILMETTE location any size. Customers can drop off rugs at LAKE FOREST location ONLY if the rug is 6x9 or smaller. Anything larger than 6x9 must be dropped at Wilmette or scheduled for pickup and delivery. No appointment needed for drop-off. IMPORTANT - if the customer asks about dropping off at Lake Forest, also mention: there is no staff at the Lake Forest showroom available to help carry the rug in - customers must be able to carry it in themselves. When answering a drop-off question at Lake Forest for an oversized rug (larger than 6x9), give a CLEAR direct answer in ONE direction - do not say 'yes you can' and then 'but you cannot'. Just say it must go to Wilmette or be scheduled for pickup. Example good response: 'For an 8x10 rug, you would need to drop it off at our Wilmette location, or we can schedule a pickup and delivery for you. Lake Forest only accepts drop-offs for rugs 6x9 or smaller. Also heads up - there is no staff at Lake Forest available to help carry the rug in.' IMPORTANT: There is no one at the Lake Forest location to help carry the rug in - the customer needs to be able to bring it in themselves. Always mention this when discussing Lake Forest drop-off.\n\nDROP-OFF RESPONSE RULES - CRITICAL: When a customer asks about dropping off a rug, do NOT say 'yes we can do that' and then immediately contradict yourself. Check the size FIRST. If the size is too big for Lake Forest, lead with the correct answer:\n- If customer mentions a rug 6x9 or smaller AND mentions Lake Forest: 'Yes, you can drop off a [size] rug at our Lake Forest location. Just a heads up - there is no one at Lake Forest to help carry the rug in, so you will need to bring it in yourself.'\n- If customer mentions a rug LARGER than 6x9 AND mentions Lake Forest: 'A [size] rug is too big for our Lake Forest drop-off - we only accept 6x9 or smaller there. You can bring it to our Wilmette location instead (any size welcome) or we can schedule a pickup.'\n- If customer mentions Lake Forest drop-off without size: 'We accept drop-offs at Lake Forest for rugs 6x9 or smaller. Anything bigger needs to come to Wilmette or be scheduled for pickup. Also, there is no one at Lake Forest to help carry the rug in - just so you know.'\n\nIN-HOME RUG CLEANING: Price $2 per sqft $199 min. Fiber protectant $2 per sqft. Enzyme for pets $2 per sqft.\n\nRUG PAD - STRICT FORMULA: Default is FIRMGRIP pad. (Note: the physical pad is cut 2 inches shorter than the rug, but this is NOT used in pricing. Do NOT subtract 2 inches when calculating price.) Follow this formula EXACTLY:\n\nStep 1: Round each rug dimension to the nearest whole foot. 6 inches or more rounds UP. 5 inches or less rounds DOWN. Example: 8 ft 7 in rounds UP to 9 ft (7 >= 6). 12 ft 3 in rounds DOWN to 12 ft (3 < 6).\nStep 2: Identify the SHORTER side and LONGER side of the rounded result.\nStep 3: Choose the roll width AND the multiplier:\n  - If SHORTER side is 6 ft or less: use 6 ft roll. Multiplier = LONGER side.\n  - If SHORTER side is more than 6 ft and 12 ft or less: use 12 ft roll. Multiplier = SHORTER side.\n  - If SHORTER side is more than 12 ft (oversized rug): no roll fits. Just use rounded width x rounded length x $2.\nStep 4: Pad price = roll width (in feet) x multiplier (in feet) x $2.\nStep 5: If the result is below $48, charge the $48 minimum.\n\nWorked examples (memorize these):\n- 5'10\" x 9' rug: rounds to 6 x 9. Shorter side 6 (<=6) so 6 ft roll, multiplier = longer = 9. Price = 6 x 9 x $2 = $108.\n- 5' x 7' rug: rounds to 5 x 7. Shorter side 5 (<=6) so 6 ft roll, multiplier = longer = 7. Price = 6 x 7 x $2 = $84.\n- 6 x 9 rug: rounds to 6 x 9. Shorter 6 (<=6) so 6 ft roll, multiplier = 9. Price = 6 x 9 x $2 = $108.\n- 8' x 10' rug: rounds to 8 x 10. Shorter side 8 (>6) so 12 ft roll, multiplier = shorter = 8. Price = 12 x 8 x $2 = $192.\n- 8'7\" x 12'3\" rug: rounds to 9 x 12. Shorter side 9 (>6) so 12 ft roll, multiplier = shorter = 9. Price = 12 x 9 x $2 = $216.\n- 9' x 12' rug: rounds to 9 x 12. Shorter 9 (>6) so 12 ft roll, multiplier = 9. Price = 12 x 9 x $2 = $216.\n- 11' x 12' rug: rounds to 11 x 12. Shorter side 11 (>6) so 12 ft roll, multiplier = shorter = 11. Price = 12 x 11 x $2 = $264.\n- 2' x 3' rug: rounds to 2 x 3. Shorter 2 (<=6) so 6 ft roll, multiplier = 3. Price = 6 x 3 x $2 = $36, but minimum is $48, so charge $48.\n- 13' x 14' rug (OVERSIZED): shorter side 13 > 12, no roll fits. Price = 13 x 14 x $2 = $364.\n\nNEVER subtract 2 inches for the math. The multiplier rule is critical: use LONGER side if shorter <= 6 ft, use SHORTER side if shorter > 6 ft. Show only the final price unless the customer asks for the breakdown.\n\nCARPET CLEANING PRICING: NEVER quote prices. Pricing done on-site. $199 minimum. Our team will measure and give you a quote when they arrive. You can also call (847) 251-1200 and ask for Adolfo for a rough estimate.\n\nCARPET CLEANING PROCESS: Steam cleaning is one of the best methods to deep clean carpet. We use the latest top-of-the-line steam cleaning equipment. Our seven-step process is built around customer satisfaction with fast-drying so there is no leftover wetness.\n\nUPHOLSTERY PRICING: Sofa, Love Seat, and Sectional: $35 per linear foot - measure the back of the piece to find the length in feet. Chair $100. Wing chair $70. Ottoman $75. Dining chair $40. Pillows $15. $199 min.\n\nUPHOLSTERY CLEANING PROCESS: Save your furniture instead of replacing it. We clean sectionals sofas chairs and ottomans in most fabrics - cotton wool suede canvas chenille and more. Every job starts with an inspection: we identify the fabric check manufacturer best practices look for stains and pet odors/oils and choose the right technique (dry clean low-moisture or steam). Wood portions are protected. We finish by gently brushing fibers so they look uniform.\n\nAREA RUG CLEANING: Each rug is hand-cleaned at our state-of-the-art Evanston warehouse - deep cleaning that removes soil embedded in the fibers not just surface dirt like steam cleaning. Pickup and delivery $4.00 per sqft, $65 minimum. Drop-off at Wilmette $3.25 per sqft, $55 minimum. 7-10 day turnaround.\n\nRUG SIZE ROUNDING RULE - CRITICAL: When calculating square footage of a rug for a price quote, round each dimension to the nearest whole foot using this rule: 6 inches or more rounds UP to the next foot, 5 inches or less rounds DOWN. Examples: 6 ft 8 in rounds UP to 7 ft (because 8 >= 6). 10 ft 5 in rounds DOWN to 10 ft (because 5 < 6). 9 ft 6 in rounds UP to 10 ft. 4 ft 3 in rounds DOWN to 4 ft. Always apply this rule to BOTH width and length before multiplying for square footage. Example: 6'8\" x 10'5\" rug = 7 ft x 10 ft = 70 sq ft.\n\nRUG REPAIR AND RESTORATION: Over 100 years of expertise restoring fine oriental and heirloom rugs. We fix holes moth damage worn fringes and uneven edges. Services include: re-serging and recasting edges custom-sizing rugs to remove damage or fit a space moth-proofing wrapping rugs for storage cutting pads to size and rug storage. Every job starts with a full inspection.\n\nCOMMERCIAL CARPET CLEANING: Yes we offer commercial carpet cleaning for businesses. Please call (847) 251-1200 for a custom quote.\n\nCUSTOM CARPET: Complimentary design consultation. Our designers help you find the right color pattern and style for your space. Professional installation - we handle pattern direction seamless cutting and proper stretching to avoid wrinkles. Visit Wilmette or Lake Forest showroom to see samples.\n\nIN-STOCK CARPETS: Yes we keep carpet in stock at our showrooms. In-stock carpets can be custom cut with custom binding to quickly fit any room in your home. Stop by Wilmette or Lake Forest to see what we have available.\n\nCUSTOM AREA RUGS: Complimentary design consultation. We are area rug sizing experts - your rug is cut to the exact size you want. Customize material binding color pattern style and placement. Samples available in contemporary transitional and traditional styles at our Wilmette and Lake Forest showrooms - you can take samples home to see how they look in your space.\n\nQUICK SHIP AREA RUGS: Stanton brand. Pre-cut sizes ready to ship within 2-3 business days anywhere in the US. Curated best-selling designs in indoor/outdoor luxury performance 100% wool and wool blends and nylons. Every rug has a hand-serged finish. Browse our selection at the showrooms or online.\n\nCARPET AND RUG BRANDS - CONVERSATIONAL APPROACH: Kashian Bros carries over 40 brands for custom carpet, in-stock carpet, custom area rugs, and stair runners. Brands include: Crescent, Rosecore, Stanton, Hibernia, Antrim, Cavan, Unique, Fibreworks, Kaleen, Home & Porch, Hook & Beam, PureLife, Design Materials, Saxony, Silver Creek, Bloomsburg, Radicci, Bellbridge, Missoni, Mantra, Prestige, Weave-Tuft, Ashley Stark Home, Couristan, Fabrica, Masland, Dixie Home, Wool Solutions, Ulster, Nourison, Nourtex, Hagaman, JMish/Riviera, Cella Katha, Living Harcourt, Rebel, Roger Oates, Rumi, Momeni, Tuftex, Milliken, Dreamweaver, Aladdin, and Glen Eden.\n\nCOMMERCIAL CARPET BRANDS: Aladdin Commercial, J & J Flooring, EF Contract, Philadelphia Commercial.\n\nBRAND CONVERSATION RULES - CRITICAL:\n- NEVER dump the full brand list on a customer in one message. It will overwhelm them.\n- When a customer asks 'what brands do you carry' or anything general, ask them what they are looking for first. Examples: 'We carry a lot of brands - what are you looking for? A wool rug, indoor/outdoor, a specific designer, something contemporary or traditional?' Or: 'Happy to help! Are you shopping for a custom carpet, an area rug, or a stair runner?'\n- After they narrow it down, mention 3-5 relevant brand names that fit what they described, then say 'and many more - stop by our Wilmette or Lake Forest showroom to see the full selection.'\n- If the customer asks about a SPECIFIC brand by name and that brand IS in the list above, confirm you carry it. Example: 'Yes, we carry Stanton - it is one of our most popular brands. Want to see the collection in person?'\n- If a brand is NOT in the list above, do not invent it. Say: 'I don't see that one on our current list - call (847) 251-1200 and we can check for you.'\n\nCUSTOM STAIR RUNNERS: A well-designed staircase elevates your whole home. We help with pattern selection (direction matters!) material choice and landing design. Stair runner installation is one of the most complex parts of our work - every stair is slightly different and we have the expertise to do it right. See samples at our Wilmette or Lake Forest showrooms.\n\nWOOD FLOORING: Our specialty is hardwood floor sanding and refinishing. Dust-free and non-toxic process, safe for babies, children, and pets to be home during. We can refinish any color floor. We use water-based polyurethane only. First step is always an inspection of the wood width and depth. Free Custom Color Consultation - just show us the color you want or ask our designers for help. We also supply unfinished hardwood in any size for new installations. Full-service from inspiration to installation. We move ALL furniture ourselves. Free in-home estimate always. (Note: we do NOT carry prefinished hardwood. ONLY mention this if the customer specifically asks about prefinished options.)\n\nHARDWOOD FLOOR REFINISHING: This is our specialty and main hardwood business - sanding and refinishing existing hardwood floors. Dust-free and non-toxic process - safe for babies children and pets to be home during. We can refinish any color floor. First step is always an inspection of the wood width and depth. Free Custom Color Consultation - just show us the color you want or ask our designers for help. We move ALL furniture ourselves. Free in-home estimate always.\n\nWOOD CABINETS: Our cabinets and vanities are custom built - designed to fit your space and style. We collaborate with you every step - from dreaming the design to installation. Schedule a free consultation to get started.\n\nCABINET HARDWARE: Impressive selection of cabinet drawer and appliance hardware - kitchen pulls knobs and finishing touches. Sourced from European vendors HAFELE and Schaub. Our designers help guide your selection to match your style.\n\nCOUNTERTOPS: Premium countertops including quartz for kitchen and bathroom remodels. We can source any countertop brand the customer wants. See touch and feel samples at our Wilmette and Lake Forest showrooms - you can borrow samples to try at home. Our designers help you choose the right color vein edge and design.\n\nVINYL FLOORING: High-quality vinyl plank 100% made in the USA. We carry CoreTec and Engineered Floors. Standard and luxury options that look and feel like hardwood. Water-resistant scratch-resistant exceptionally durable - perfect for basements laundry rooms mud rooms and bathrooms.\n\nTILE AND BACKSPLASH: Wide selection of tile and backsplashes for kitchens and bathrooms - a great way to add personality to a space. We carry Virginia Tile and MSI. Our designers help you navigate shapes sizes colors and materials. Works as a standalone project or as part of a larger kitchen/bath remodel.\n\nKITCHEN REMODELING: Full-service stress-free kitchen remodeling. Personalized designs to fit your daily life. We manage the entire process - from initial design through completion - with a streamlined transparent approach. Free consultation. Dedicated project manager.\n\nBATHROOM REMODELING: Stress-free full-service bathroom remodeling. Personalized designs that balance function and beauty. We manage every step - from initial design through final installation. Free consultation. Dedicated project manager.\n\nSTAIN REMOVAL - STRICT RULES: You must ONLY use the responses listed below. Do not add generic stain advice from your general knowledge. Do not mention hydrogen peroxide, baking soda, hot water, or any treatments not listed here. If a customer asks about a stain type not listed below, you must say: 'Please call (847) 251-1200 and we can help you with that.'\nListed responses: Blot never scrub. Pet stain: blot warm water dish soap vinegar. Wine: blot club soda. Mud: let dry first. Blood: cold water.\n\nCHICAGO SURCHARGES - SOUTH OF IRVING PARK: Carpet and upholstery cleaning has a $450 minimum and $150 trip charge. Rug pickup and delivery has a $250 trip charge.\n\nRUG CLEANING PRICING FLOW: When you answer a rug pricing question, after giving the price always end with: [BUTTONS:Schedule a Pickup|I have more questions]\n\nFor questions about pricing or services not listed, invite them to call (847) 251-1200 or visit a showroom.";
  var TODAY = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Chicago' });
  SP = 'TODAY IS: ' + TODAY + '. Use this to understand relative terms like tomorrow, next week etc.\n\n' + SP;
  var hist = [], cnt = 1, availCache = null;
  var flow = { active: false, type: null, step: null, service: null, duration: 0, awaitingText: false, scope: null, customerInfo: null, timeChoice: null };
  // =========================
  // STYLES
  // =========================
  var style = document.createElement('style');
  style.innerHTML = [
    '#kb-chat-btn{position:fixed;bottom:24px;right:24px;height:60px;padding:0 22px 0 6px;border-radius:30px;border:none;background:#88EAE4;color:#fff;font-size:15px;font-weight:700;font-family:Raleway,Arial,sans-serif;cursor:pointer;z-index:999998;box-shadow:0 8px 30px rgba(0,0,0,0.22);transition:transform .2s ease,box-shadow .2s ease;display:flex;align-items:center;gap:12px;letter-spacing:0.01em;text-shadow:0 1px 2px rgba(0,0,0,0.08);}',
    '#kb-chat-btn .kb-avatar{width:48px;height:48px;border-radius:50%;background:#fff;color:#88EAE4;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;text-shadow:none;flex-shrink:0;overflow:hidden;}',
    '#kb-chat-btn .kb-avatar svg{display:block;}',
    '#kb-chat-btn:hover{transform:translateY(-2px);box-shadow:0 12px 36px rgba(0,0,0,0.28);}',
    '#kb-chat-btn svg{flex-shrink:0;}',
    '#kb-chat-widget{position:fixed;bottom:96px;left:50%;transform:translateX(-50%);width:450px;height:720px;background:#fff;border-radius:16px;overflow:hidden;display:none;flex-direction:column;z-index:999998;box-shadow:0 20px 60px rgba(0,0,0,0.22);border:1px solid #88EAE4;font-family:Raleway,Arial,sans-serif;color:#111;letter-spacing:0.02em;}',
    '#kb-chat-widget *{box-sizing:border-box;}',
    '@keyframes kb-bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}',
    '.kb-hdr{background:#5bcdc7;padding:13px 16px;display:flex;align-items:center;gap:10px;border-bottom:1px solid #9de8e4;flex-shrink:0;}',
    '.kb-av{width:38px;height:38px;background:#7ddbd6;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}',
    '.kb-ht{color:#111;font-size:14px;font-weight:700;}',
    '.kb-hs{color:#1a1a1a;font-size:11px;margin-top:1px;}',
    '.kb-dot{width:8px;height:8px;background:#4ade80;border-radius:50%;margin-left:auto;flex-shrink:0;}',
    '.kb-close{background:none;border:none;cursor:pointer;font-size:20px;color:#111;margin-left:8px;padding:2px 6px;flex-shrink:0;line-height:1;}',
    '.kb-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:12px;background:#fff;}',
    '.kb-row{display:flex;gap:8px;max-width:95%;}',
    '.kb-row.u{flex-direction:row-reverse;align-self:flex-end;}',
    '.kb-row.b{align-self:flex-start;}',
    '.kb-ic{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;margin-top:2px;}',
    '.kb-ic.b{background:#b8eeeb;}.kb-ic.u{background:#e0eaff;}',
    '.kb-bub{padding:10px 13px;font-size:13px;line-height:1.65;color:#111;word-wrap:break-word;}',
    '.kb-bub *{color:#111!important;}',
    '.kb-bub.b{background:#f0fafa;border-radius:3px 14px 14px 14px;}',
    '.kb-bub.u{background:#5bcdc7;border-radius:14px 3px 14px 14px;}',
    '.kb-bub p{margin:0 0 5px;}.kb-bub p:last-child{margin:0;}',
    '.kb-bub ul{padding-left:16px;margin:5px 0;}.kb-bub li{margin-bottom:3px;}',
    '.kb-typing{display:flex;gap:4px;padding:12px 14px;background:#f0fafa;border-radius:3px 14px 14px 14px;align-items:center;}',
    '.kb-typing div{width:7px;height:7px;border-radius:50%;background:#5bcdc7;animation:kb-bounce 1.2s infinite;}',
    '.kb-typing div:nth-child(2){animation-delay:.2s;}.kb-typing div:nth-child(3){animation-delay:.4s;}',
    '.kb-ir{background:#fff;border-top:1px solid #b8eeeb;padding:10px 12px;display:flex;gap:8px;align-items:flex-end;flex-shrink:0;}',
    '.kb-inp{flex:1;border:1.5px solid #9de8e4;border-radius:10px;padding:9px 11px;font-size:13px;font-family:inherit;resize:none;outline:none;line-height:1.5;max-height:80px;overflow-y:auto;color:#111;}',
    '.kb-sb{width:36px;height:36px;background:#5bcdc7;border:none;border-radius:9px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;}',
    '.kb-sb:disabled{background:#94a3b8;cursor:not-allowed;}',
    '.kb-inline-btns{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px;}',
    '.kb-inline-btn{font-family:inherit;cursor:pointer;background:#fff;border:1.5px solid #0891b2;color:#0891b2;border-radius:6px;padding:5px 10px;font-size:12px!important;font-weight:500!important;white-space:normal;line-height:1.3;text-align:center;width:auto!important;display:inline-block!important;text-shadow:none!important;}',
    '.kb-inline-btn:hover{background:#0891b2;color:#fff;}',
    '.kb-inline-btn:disabled{opacity:0.4;cursor:not-allowed;}',
    '.kb-menu-title{font-size:10px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:3px;padding-bottom:2px;border-bottom:1px solid #e2e8f0;}',
    '.kb-form{background:#fff;border:2px solid #5bcdc7;border-radius:10px;padding:12px;margin-top:6px;font-size:13px;}',
    '.kb-form h3{color:#111;font-size:13px;margin-bottom:10px;font-weight:700;}',
    '.kb-note{background:#fffbeb;border:1px solid #fcd34d;border-radius:6px;padding:8px 10px;margin-bottom:9px;font-size:11.5px;color:#92400e;line-height:1.5;}',
    '.kb-row-2{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:8px;}',
    '.kb-frow{margin-bottom:8px;}',
    '.kb-label{display:block;font-size:11px;font-weight:700;color:#333;margin-bottom:3px;}',
    '.kb-input{width:100%;border:1.5px solid #9de8e4;border-radius:7px;padding:7px 9px;font-size:12.5px;font-family:inherit;outline:none;color:#111;background:#fff;}',
    '.kb-input:focus{border-color:#5bcdc7;}',
    '.kb-textarea{width:100%;border:1.5px solid #9de8e4;border-radius:7px;padding:7px 9px;font-size:12.5px;font-family:inherit;outline:none;color:#111;resize:vertical;}',
    '.kb-check{display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;font-size:12.5px;color:#111;}',
    '.kb-check input{width:14px;height:14px;accent-color:#5bcdc7;}',
    '.kb-submit{background:#5bcdc7;color:#111;border:none;border-radius:8px;padding:10px 16px;font-size:13px;font-weight:700;cursor:pointer;width:100%;margin-top:4px;font-family:inherit;}',
    '.kb-submit:hover{background:#7ddbd6;}.kb-submit:disabled{opacity:0.4;cursor:not-allowed;}',
    '.kb-cancel{background:none;border:1px solid #9de8e4;color:#333;border-radius:8px;padding:7px 12px;font-size:12px;cursor:pointer;width:100%;margin-top:6px;font-family:inherit;}',
    '.kb-section{border:1.5px solid #9de8e4;border-radius:8px;margin-bottom:9px;overflow:hidden;}',
    '.kb-section-hdr{background:#f0fafa;padding:9px 12px;font-size:12.5px;font-weight:700;color:#111;cursor:pointer;display:flex;justify-content:space-between;align-items:center;}',
    '.kb-section-hdr:hover{background:#e0f7f5;}',
    '.kb-section-body{padding:10px;}',
    '.kb-duration-box{background:#eff6ff;border:1.5px solid #60a5fa;border-radius:8px;padding:9px 12px;margin-top:6px;font-size:12.5px;color:#1e40af;text-align:center;}',
    '.kb-price-box{background:#f0fdf4;border:1.5px solid #86efac;border-radius:8px;padding:10px 12px;margin:8px 0;font-size:12.5px;color:#14532d;}',
    '.kb-price-line{padding:2px 0;display:flex;justify-content:space-between;}',
    '.kb-price-line strong{color:#14532d;font-weight:600;}',
    '.kb-price-total{margin-top:7px;padding-top:7px;border-top:1px solid #bbf7d0;font-size:13px;display:flex;justify-content:space-between;color:#14532d;font-weight:700;}',
    '.kb-price-note{margin-top:5px;font-size:11px;color:#166534;font-style:italic;}',
    '.kb-pricing-note{background:#fffbeb;border:1px solid #fcd34d;border-left:4px solid #f59e0b;border-radius:6px;padding:9px 11px;margin:9px 0;font-size:11.5px;color:#7c2d12;line-height:1.55;}',
    '.kb-qty-table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:8px;}',
    '.kb-qty-table th{text-align:left;padding:5px 7px;background:#f0fafa;font-size:11px;color:#333;border-bottom:1px solid #9de8e4;}',
    '.kb-qty-table td{padding:4px 7px;border-bottom:1px solid #f0fafa;vertical-align:middle;}',
    '.kb-qty{display:flex;align-items:center;gap:6px;}',
    '.kb-qty button{width:22px;height:22px;border:1.5px solid #9de8e4;border-radius:5px;background:#fff;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;color:#111;font-family:inherit;}',
    '.kb-qty button:hover{background:#5bcdc7;}',
    '.kb-qty span{min-width:18px;text-align:center;font-weight:700;font-size:13px;}',
    '.kb-addons{margin:7px 0;display:flex;flex-wrap:wrap;gap:5px;}',
    '.kb-extra-tag{font-size:10px;color:#92400e;background:#fef9c3;padding:1px 5px;border-radius:4px;margin-left:2px;font-weight:700;}',
    '.kb-rug-row{display:flex;align-items:center;gap:3px;margin-bottom:5px;flex-wrap:wrap;}',
    '.kb-rug-row input{width:48px!important;text-align:center;padding:6px 3px!important;}',
    '.kb-flow-top{background:#f8fafc;border-bottom:1px solid #e2e8f0;padding:10px 12px;margin:-12px -12px 12px -12px;border-radius:8px 8px 0 0;}',
    '.kb-flow-row{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:12px;color:#111;padding:2px 0;}',
    '.kb-flow-row+.kb-flow-row{border-top:1px solid #e2e8f0;margin-top:5px;padding-top:7px;}',
    '.kb-flow-check{color:#16a34a;font-weight:700;margin-right:3px;}',
    '.kb-flow-edit{background:none;border:none;color:#0891b2;cursor:pointer;font-size:11px;font-family:inherit;text-decoration:underline;}',
    '.kb-stage-2,.kb-stage-3{padding-top:14px;margin-top:14px;border-top:1px solid #e2e8f0;}',
    '.kb-stage-hdr{font-size:10px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;}',
    '.kb-times-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px;}',
    '.kb-time-btn{font-family:inherit;cursor:pointer;background:#fff;border:1.5px solid #5bcdc7;color:#0e7490;border-radius:8px;padding:9px 6px;font-size:11.5px;font-weight:500;text-align:center;line-height:1.3;word-break:keep-all;}',
    '.kb-time-btn:hover{background:#5bcdc7;color:#111;}',
    '.kb-time-other{font-family:inherit;cursor:pointer;background:none;border:none;color:#0891b2;font-size:12px;text-decoration:underline;padding:5px 0;margin-top:3px;display:block;width:100%;text-align:center;}',
    '.kb-review-block{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px;margin:7px 0;}',
    '.kb-review-line{display:flex;gap:8px;padding:4px 0;font-size:12px;color:#111;border-bottom:1px solid #f1f5f9;}',
    '.kb-review-line:last-child{border-bottom:none;}',
    '.kb-review-label{min-width:60px;font-size:10.5px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;padding-top:1px;}',
    '.kb-success{background:#f0fdf4;border:2px solid #16a34a;border-radius:10px;padding:14px;margin-top:6px;}',
    '.kb-success h3{color:#15803d;margin-bottom:5px;font-size:14px;}',
    '.kb-success p{font-size:12.5px;color:#166534;margin-top:5px;}',
    '.kb-uphol-note{background:#fffbeb;border:1px solid #fcd34d;border-left:4px solid #f59e0b;border-radius:6px;padding:8px 10px;margin-bottom:8px;font-size:11.5px;color:#7c2d12;line-height:1.5;font-style:italic;}',
    '.kb-contact-hide{display:none;}',
    '#kb-chat-widget .kb-inline-btn *{text-shadow:none!important;}',
    '#kb-chat-widget .kb-inline-btn{text-shadow:none!important;}',
    '#kb-chat-widget button{text-shadow:none!important;}',
    '@media(max-width:480px){#kb-chat-widget{width:calc(100vw - 20px);height:calc(100vh - 140px);left:50%;transform:translateX(-50%);right:auto;bottom:80px;}.kb-times-grid{grid-template-columns:1fr;}.kb-inline-btn{font-size:11px!important;padding:4px 8px!important;font-weight:500!important;width:auto!important;display:inline-block!important;line-height:1.3!important;}}'
  ].join('');
  document.head.appendChild(style);
  // =========================
  // BUILD WIDGET
  // =========================
  var btn = document.createElement('button');
  btn.id = 'kb-chat-btn';
  btn.innerHTML = '<span class="kb-avatar"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M7 9c0-2.21 1.79-4 4-4h6c2.21 0 4 1.79 4 4v4c0 2.21-1.79 4-4 4h-1l-2.5 2.5L13 17H11c-2.21 0-4-1.79-4-4V9z" fill="#88EAE4"/><path d="M3 6c0-1.66 1.34-3 3-3h6c1.66 0 3 1.34 3 3v4c0 1.66-1.34 3-3 3h-1.5L8 15l-.5-2H6c-1.66 0-3-1.34-3-3V6z" fill="#5bcdc7"/></svg></span><span>Questions? Scheduling? Let\'s chat</span>';
  btn.title = 'Chat with Kay';
  var widget = document.createElement('div');
  widget.id = 'kb-chat-widget';
  widget.innerHTML =
    '<div class="kb-hdr">' +
      '<div class="kb-av">&#x1F9F9;</div>' +
      '<div><div class="kb-ht">Kay &mdash; Kashian Bros</div><div class="kb-hs">Flooring, Remodeling &amp; Cleaning</div></div>' +
      '<div class="kb-dot"></div>' +
      '<button class="kb-close" id="kb-close-btn">&times;</button>' +
    '</div>' +
    '<div class="kb-msgs" id="kb-msgs"></div>' +
    '<div class="kb-ir">' +
      '<textarea id="kb-inp" class="kb-inp" rows="1" placeholder="Ask Kay anything..."></textarea>' +
      '<button class="kb-sb" id="kb-sb"><svg width="15" height="15" viewBox="0 0 24 24" fill="#111"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>' +
    '</div>';
  document.body.appendChild(btn);
  document.body.appendChild(widget);
  var msgsEl = document.getElementById('kb-msgs');
  var inpEl = document.getElementById('kb-inp');
  var sbEl = document.getElementById('kb-sb');
  btn.onclick = function () {
    widget.style.display = widget.style.display === 'flex' ? 'none' : 'flex';
  };
  document.getElementById('kb-close-btn').onclick = function () { widget.style.display = 'none'; };
  // =========================
  // HELPERS
  // =========================
  function scrollBottom() { msgsEl.scrollTop = msgsEl.scrollHeight; }
  function scrollNice(el, offset) {
    if (!el) return;
    offset = offset || 12;
    // Scroll so the TOP of the target element sits near the top of the chat area.
    // This puts the new stage right at the top of view, with all its content (including action button) below it.
    setTimeout(function () {
      var rect = msgsEl.getBoundingClientRect();
      var elRect = el.getBoundingClientRect();
      var delta = elRect.top - rect.top - offset;
      msgsEl.scrollTo({ top: msgsEl.scrollTop + delta, behavior: 'smooth' });
    }, 150);
  }
  function nl2html(t) {
    var extra = '';
    t = t.replace(/\[BUTTONS:([^\]]+)\]/g, function (m, labels) {
      extra += '<div class="kb-inline-btns">' + labels.split('|').map(function (l) {
        return '<button class="kb-inline-btn" onclick="kbHandleInput(this.textContent,this)">' + l.trim() + '</button>';
      }).join('') + '</div>';
      return '';
    });
    var html = t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/#{1,3} (.*)/g, '<strong>$1</strong>')
      .split('\n').map(function (l) { var b = l.match(/^- (.*)/); return b ? '<li>' + b[1] + '</li>' : (l.trim() ? '<p>' + l + '</p>' : ''); })
      .join('').replace(/(<li>.*?<\/li>)+/g, function (m) { return '<ul>' + m + '</ul>'; });
    return html + extra;
  }
  function getConfirmTiming() {
    var now = new Date(), d = now.getDay(), h = now.getHours(), tv = h + now.getMinutes() / 60;
    if (d === 0) return 'Our team is closed today. Adolfo will confirm your booking first thing Monday morning.';
    if (d === 6) { if (tv < 10) return 'Our team opens at 10am on Saturdays. Adolfo will confirm your booking by then.'; if (tv < 15) return 'Adolfo will confirm your booking within about an hour, before we close at 3pm today.'; return 'Our Saturday hours have ended. Adolfo will confirm your booking first thing Monday morning.'; }
    if (tv < 9) return 'Our team starts at 9am. Adolfo will confirm your booking by then this morning.';
    if (tv < 17) return 'Adolfo will confirm your booking within about an hour, and always before 5pm today.';
    return 'Our team has closed for the day. Adolfo will confirm your booking first thing tomorrow morning.';
  }
  function fmtDuration(m) { if (!m) return '0 min'; if (m < 60) return m + ' min'; var h = Math.floor(m / 60), r = m % 60; return r ? h + 'h ' + r + 'm' : h + (h === 1 ? ' hour' : ' hours'); }
  function fmtRange(lo, hi) { var mid = Math.round(((lo + hi) / 2) / 30) * 30; if (mid < 60) mid = 60; var l = Math.max(60, mid - 30), h2 = mid + 30; function asH(x) { var v = x / 60; return v === Math.floor(v) ? v + '' : v.toFixed(1); } return l === h2 ? fmtDuration(l) : asH(l) + '-' + asH(h2) + ' hours'; }
  function fmtRounded(m) { return fmtDuration(Math.ceil((m || 0) / 10) * 10); }
  function getQty(id) {
    var el = document.getElementById(id);
    if (!el) return 0;
    // For number inputs (linear ft), read .value; for spans, read textContent
    var raw = (el.tagName === 'INPUT') ? el.value : el.textContent;
    return parseInt(raw) || 0;
  }
  // =========================
  // PRICING DATA
  // =========================
  var CR = { 'c-liv': { n: 'Living / Family Room', d: 30 }, 'c-din': { n: 'Dining Room', d: 30 }, 'c-mbd': { n: 'Master Bedroom', d: 50 }, 'c-bed': { n: 'Bedroom', d: 30 }, 'c-off': { n: 'Office / Den', d: 30 }, 'c-bsm': { n: 'Small Basement', d: 45 }, 'c-bml': { n: 'Large Basement', d: 75 }, 'c-hal': { n: 'Hallway', d: 20 }, 'c-sta': { n: 'Stairs (per flight)', d: 20 } };
  var UI = { 'u-sof': { n: 'Sofa / Love Seat / Sectional (linear ft)', p: 35, d: 10 }, 'u-cha': { n: 'Chair', p: 100, d: 20 }, 'u-win': { n: 'Wing Chair', p: 70, d: 20 }, 'u-ott': { n: 'Ottoman', p: 75, d: 15 }, 'u-din': { n: 'Dining Chair', p: 40, d: 15 }, 'u-pil': { n: 'Pillow / Cushion', p: 15, d: 5 } };
  function calcJobDuration(mid) {
    var total = 0, has = false;
    Object.keys(CR).forEach(function (k) { var q = getQty(k + '-' + mid); if (q) { total += q * CR[k].d; has = true; } });
    Object.keys(UI).forEach(function (k) { var q = getQty(k + '-' + mid); if (q) { total += q * UI[k].d; has = true; } });
    if (has) total += 20;
    return total > 0 && total < 60 ? 60 : total;
  }
  function adjQty(id, delta, mid) {
    var el = document.getElementById(id); if (!el) return;
    el.textContent = Math.max(0, parseInt(el.textContent || '0') + delta);
    updateScopeDuration(mid);
  }
  function updateScopeDuration(mid) {
    var box = document.getElementById('kb-scdur-' + mid);
    var findBtn = document.getElementById('kb-scfind-' + mid);
    var mins = calcJobDuration(mid);
    if (!box) return;
    if (!mins) {
      box.innerHTML = '<small style="color:#1e40af">Pick at least one room or item to see your job time</small>';
      box.style.background = '#f1f5f9'; box.style.borderColor = '#cbd5e1';
      if (findBtn) { findBtn.disabled = true; findBtn.style.opacity = '0.4'; findBtn.style.cursor = 'not-allowed'; }
    } else {
      var lo = Math.max(60, mins - 30), hi = mins + 30;
      var hasCarpet = false, hasUphol = false;
      Object.keys(CR).forEach(function (k) { if (getQty(k + '-' + mid)) hasCarpet = true; });
      Object.keys(UI).forEach(function (k) { if (getQty(k + '-' + mid)) hasUphol = true; });
      var subj = []; if (hasCarpet) subj.push('carpet'); if (hasUphol) subj.push('upholstery');
      box.innerHTML = 'Estimated time: <strong>' + fmtRange(lo, hi) + '</strong><br><small style="color:#1e40af;font-style:italic">Times may vary based on furniture and condition of your ' + subj.join(' and ') + '.</small>';
      box.style.background = '#eff6ff'; box.style.borderColor = '#60a5fa';
      if (findBtn) { findBtn.disabled = false; findBtn.style.opacity = '1'; findBtn.style.cursor = 'pointer'; }
    }
  }
  window.kbToggleSection = function (bodyId, arrowId) {
    var b = document.getElementById(bodyId), a = arrowId ? document.getElementById(arrowId) : null;
    if (!b) return;
    var open = b.style.display !== 'none';
    b.style.display = open ? 'none' : 'block';
    if (a) a.textContent = open ? '+' : '\u2212';
  };
  // =========================
  // ADDRESS AUTOCOMPLETE
  // =========================
  function setupAC(input) {
    if (input.dataset.ac) return; input.dataset.ac = '1';
    var dd = document.createElement('div');
    dd.style.cssText = 'position:absolute;background:#fff;border:1px solid #9de8e4;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,.1);z-index:9999999;width:100%;max-height:180px;overflow-y:auto;display:none;font-family:inherit;font-size:12.5px';
    input.parentNode.style.position = 'relative'; input.parentNode.appendChild(dd);
    var t = null;
    input.addEventListener('input', function () {
      clearTimeout(t); var v = input.value.trim(); if (v.length < 3) { dd.style.display = 'none'; return; }
      t = setTimeout(function () {
        fetch(PLACES_URL + '?input=' + encodeURIComponent(v)).then(function (r) { return r.json(); }).then(function (d) {
          dd.innerHTML = ''; if (!d.suggestions || !d.suggestions.length) { dd.style.display = 'none'; return; }
          d.suggestions.forEach(function (s) {
            var item = document.createElement('div'); item.textContent = s;
            item.style.cssText = 'padding:9px 12px;cursor:pointer;border-bottom:1px solid #f0fafa;color:#111';
            item.addEventListener('mousedown', function (e) { e.preventDefault(); input.value = s; dd.style.display = 'none'; });
            item.addEventListener('mouseover', function () { item.style.background = '#f0fafa'; });
            item.addEventListener('mouseout', function () { item.style.background = '#fff'; });
            dd.appendChild(item);
          }); dd.style.display = 'block';
        }).catch(function () { dd.style.display = 'none'; });
      }, 300);
    });
    input.addEventListener('blur', function () { setTimeout(function () { dd.style.display = 'none'; }, 200); });
  }
  function setupAllAC() { document.querySelectorAll('[data-addr="1"]').forEach(setupAC); }
  new MutationObserver(setupAllAC).observe(widget, { childList: true, subtree: true });
  // =========================
  // TABLES
  // =========================
  function mkQtyBtn(txt, k, mid, delta) {
    var b = document.createElement('button'); b.type = 'button'; if (delta > 0) b.textContent = '+'; else b.innerHTML = '&minus;';
    b.onclick = function () { adjQty(k + '-' + mid, delta, mid); }; return b;
  }
  function buildCarpetTable(mid) {
    var tbl = document.createElement('table'); tbl.className = 'kb-qty-table';
    tbl.innerHTML = '<tr><th>Room</th><th>Qty</th></tr>';
    [['c-liv','Living / Family Room'],['c-din','Dining Room'],['c-mbd','Master Bedroom'],['c-bed','Bedroom'],['c-off','Office / Den'],['c-bsm','Small Basement'],['c-bml','Large Basement'],['c-hal','Hallway'],['c-sta','Stairs (per flight)']].forEach(function (r) {
      var tr = document.createElement('tr');
      var td1 = document.createElement('td'); td1.textContent = r[1];
      var td2 = document.createElement('td'); var div = document.createElement('div'); div.className = 'kb-qty';
      var sp = document.createElement('span'); sp.id = r[0] + '-' + mid; sp.textContent = '0';
      div.appendChild(mkQtyBtn('+', r[0], mid, 1)); div.appendChild(sp); div.appendChild(mkQtyBtn('-', r[0], mid, -1));
      td2.appendChild(div); tr.appendChild(td1); tr.appendChild(td2); tbl.appendChild(tr);
    });
    return tbl;
  }
  function buildUpholTable(mid) {
    var tbl = document.createElement('table'); tbl.className = 'kb-qty-table';
    tbl.innerHTML = '<tr><th>Item</th><th>Price</th><th style="text-align:center">Qty</th></tr>';
    var rows = [['u-sof','Sofa / Love Seat / Sectional','$35/ft', true, 'Measure the back of the piece(s) in feet'],['u-cha','Chair','$100', false],['u-win','Wing Chair','$70', false],['u-ott','Ottoman','$75', false],['u-din','Dining Chair','$40', false],['u-pil','Pillow / Cushion','$15', false]];
    rows.forEach(function (r) {
      var tr = document.createElement('tr');
      var td1 = document.createElement('td');
      if (r[4]) {
        td1.innerHTML = '<div style="font-weight:500">' + r[1] + '</div><div style="font-size:10.5px;color:#666;margin-top:2px;font-style:italic">' + r[4] + '</div>';
      } else {
        td1.textContent = r[1];
      }
      var td2 = document.createElement('td'); td2.textContent = r[2];
      var td3 = document.createElement('td'); td3.style.textAlign = 'center';
      if (r[3]) {
        // Number input styled to fit the row height like the +/- cluster
        var wrap = document.createElement('div');
        wrap.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:4px;';
        var input = document.createElement('input');
        input.type = 'number'; input.min = '0'; input.value = '0';
        input.id = r[0] + '-' + mid;
        input.style.cssText = 'width:46px;height:22px;text-align:center;padding:0 4px;border:1.5px solid #9de8e4;border-radius:5px;font-family:inherit;font-size:13px;font-weight:700;color:#111;background:#fff;-moz-appearance:textfield;';
        input.addEventListener('input', function () { updateScopeDuration(mid); });
        input.addEventListener('focus', function () { if (input.value === '0') input.value = ''; });
        input.addEventListener('blur', function () { if (input.value === '' || isNaN(parseInt(input.value))) input.value = '0'; updateScopeDuration(mid); });
        var ftLabel = document.createElement('span');
        ftLabel.textContent = 'ft';
        ftLabel.style.cssText = 'font-size:11px;color:#666;font-weight:600;';
        wrap.appendChild(input); wrap.appendChild(ftLabel);
        td3.appendChild(wrap);
      } else {
        var div = document.createElement('div'); div.className = 'kb-qty';
        var sp = document.createElement('span'); sp.id = r[0] + '-' + mid; sp.textContent = '0';
        div.appendChild(mkQtyBtn('+', r[0], mid, 1)); div.appendChild(sp); div.appendChild(mkQtyBtn('-', r[0], mid, -1));
        td3.appendChild(div);
      }
      tr.appendChild(td1); tr.appendChild(td2); tr.appendChild(td3); tbl.appendChild(tr);
    });
    return tbl;
  }
  // =========================
  // RUG SIZE ROWS
  // =========================
  function addRugRow(containerId, mid, prefix) {
    var container = document.getElementById(containerId); if (!container) return;
    var n = container.querySelectorAll('.kb-rug-row').length + 1;
    var row = document.createElement('div'); row.className = 'kb-rug-row';
    function mkIn(sfx, ph) {
      var el = document.createElement('input'); el.className = 'kb-input';
      el.style.cssText = 'width:48px;text-align:center;padding:6px 3px';
      el.placeholder = ph; el.id = prefix + sfx + n + '-' + mid; el.type = 'number'; el.min = '0';
      el.dataset.mid = mid; el.dataset.prefix = prefix;
      el.addEventListener('input', function () { calcRugPrice(mid, prefix); }); return el;
    }
    function mkSp(t) { var s = document.createElement('span'); s.style.cssText = 'font-size:10.5px;color:#666'; s.textContent = t; return s; }
    var del = document.createElement('button'); del.type = 'button';
    del.style.cssText = 'background:none;border:none;color:#dc2626;cursor:pointer;font-size:16px;padding:0 3px;margin-left:2px';
    del.textContent = '\u00d7'; del.onclick = function () { row.remove(); calcRugPrice(mid, prefix); };
    row.appendChild(mkIn('wft', '8')); row.appendChild(mkSp('ft'));
    row.appendChild(mkIn('win', '0')); row.appendChild(mkSp('in \u00d7'));
    row.appendChild(mkIn('hft', '10')); row.appendChild(mkSp('ft'));
    row.appendChild(mkIn('hin', '0')); row.appendChild(mkSp('in'));
    row.appendChild(del); container.appendChild(row);
  }
  window.kbAddRugRow = function (mid, prefix) { addRugRow('kb-rugrows-' + mid, mid, prefix); };
  function calcRugPrice(mid, prefix) {
    var container = document.getElementById('kb-rugrows-' + mid); if (!container) return;
    var totalSqft = 0, rugCount = 0, oversizeCount = 0, rugDesc = [];
    function rnd(ft, inches) { return (parseInt(ft) || 0) + ((parseInt(inches) || 0) >= 6 ? 1 : 0); }
    container.querySelectorAll('.kb-rug-row').forEach(function (row, i) {
      var n = i + 1;
      var wft = document.getElementById(prefix + 'wft' + n + '-' + mid);
      var win = document.getElementById(prefix + 'win' + n + '-' + mid);
      var hft = document.getElementById(prefix + 'hft' + n + '-' + mid);
      var hin = document.getElementById(prefix + 'hin' + n + '-' + mid);
      if (!wft || !hft) return;
      var w = rnd(wft.value, win ? win.value : 0), h = rnd(hft.value, hin ? hin.value : 0);
      if (!w || !h) return;
      rugCount++; totalSqft += w * h;
      if (Math.max(w, h) > 15 || Math.min(w, h) > 10) oversizeCount++;
      rugDesc.push((parseInt(wft.value)||0) + 'ft \u00d7 ' + (parseInt(hft.value)||0) + 'ft (billed as ' + w + 'x' + h + ')');
    });
    var pb = document.getElementById('kb-rugprice-' + mid);
    var db = document.getElementById('kb-rugdur-' + mid);
    var fb = document.getElementById('kb-rugfind-' + mid);
    if (!rugCount) {
      if (pb) pb.style.display = 'none';
      if (db) { db.innerHTML = '<small style="color:#1e40af">Add at least one rug to see your estimate</small>'; db.style.background = '#f1f5f9'; db.style.borderColor = '#cbd5e1'; }
      if (fb) { fb.disabled = true; fb.style.opacity = '0.4'; fb.style.cursor = 'not-allowed'; }
      return;
    }
    var base = Math.max(65, totalSqft * 4);
    var pEl = document.getElementById(prefix + 'protect-' + mid), eEl = document.getElementById(prefix + 'enzyme-' + mid);
    var protect = (pEl && pEl.checked) ? totalSqft * 2 : 0;
    var enzyme = (eEl && eEl.checked) ? totalSqft * 2 : 0;
    var total = base + protect + enzyme;
    var html = '<div class="kb-price-line">Rug Cleaning (' + totalSqft + ' sq ft): <strong>$' + base.toFixed(2) + '</strong></div>';
    if (protect) html += '<div class="kb-price-line">Fiber Protectant: <strong>$' + protect.toFixed(2) + '</strong></div>';
    if (enzyme) html += '<div class="kb-price-line">Enzyme Treatment: <strong>$' + enzyme.toFixed(2) + '</strong></div>';
    html += '<div class="kb-price-total">Estimated Total: <strong>$' + total.toFixed(2) + '</strong></div><div class="kb-price-note">$65 minimum. 7-10 day turnaround.</div>';
    if (pb) { pb.innerHTML = html; pb.style.display = 'block'; }
    var pickMin = (rugCount === 1 ? 15 : rugCount <= 3 ? 25 : 45) + oversizeCount * 15;
    if (db) { db.innerHTML = 'Estimated pickup time: <strong>' + fmtRounded(pickMin) + '</strong>'; db.style.background = '#eff6ff'; db.style.borderColor = '#60a5fa'; }
    if (fb) { fb.disabled = false; fb.style.opacity = '1'; fb.style.cursor = 'pointer'; }
    var fe = document.getElementById('kb-rugscope-' + mid);
    if (fe) { fe.dataset.rc = rugCount; fe.dataset.rs = totalSqft; fe.dataset.rt = total.toFixed(2); fe.dataset.rb = base.toFixed(2); fe.dataset.rp = protect.toFixed(2); fe.dataset.re = enzyme.toFixed(2); fe.dataset.rd = pickMin; fe.dataset.rdesc = rugDesc.join(', '); }
  }
  window.kbCalcRug = function (mid, prefix) { calcRugPrice(mid, prefix); };
  // =========================
  // INFO FORM
  // =========================
  function buildInfoForm(mid, nextType) {
    var f = document.createElement('div'); f.className = 'kb-form'; f.id = 'kb-info-' + mid;
    f.innerHTML =
      '<h3>Your Information</h3>' +
      '<div class="kb-note">We will use this to confirm your appointment.</div>' +
      '<div class="kb-row-2">' +
        '<div class="kb-frow"><label class="kb-label">First Name *</label><input class="kb-input" id="kb-ifn-' + mid + '" placeholder="Jane"/></div>' +
        '<div class="kb-frow"><label class="kb-label">Last Name *</label><input class="kb-input" id="kb-iln-' + mid + '" placeholder="Smith"/></div>' +
      '</div>' +
      '<div class="kb-row-2">' +
        '<div class="kb-frow"><label class="kb-label">Phone *</label><input class="kb-input" id="kb-iph-' + mid + '" placeholder="(847) 555-1234" type="tel"/></div>' +
        '<div class="kb-frow"><label class="kb-label">Email *</label><input class="kb-input" id="kb-iem-' + mid + '" placeholder="you@email.com" type="email"/></div>' +
      '</div>' +
      '<div class="kb-frow"><label class="kb-label">Full Address (include city) *</label><input class="kb-input" id="kb-iad-' + mid + '" placeholder="123 Main St, Wilmette, IL 60091" data-addr="1" autocomplete="off"/></div>' +
      '<label class="kb-check"><input type="checkbox" id="kb-isp-' + mid + '" onchange="kbTogCtx(\'i\',\'' + mid + '\',this.checked)" checked/> I will be there to let your crew in</label>' +
      '<div id="kb-ictx-' + mid + '" class="kb-contact-hide">' +
        '<div class="kb-note" style="margin-bottom:7px">Provide the on-site contact:</div>' +
        '<div class="kb-row-2">' +
          '<div class="kb-frow"><label class="kb-label">Contact Name *</label><input class="kb-input" id="kb-icn-' + mid + '" placeholder="Name"/></div>' +
          '<div class="kb-frow"><label class="kb-label">Contact Phone *</label><input class="kb-input" id="kb-icp-' + mid + '" placeholder="Phone"/></div>' +
        '</div>' +
      '</div>' +
      '<div class="kb-frow"><label class="kb-label">Additional Notes</label><textarea class="kb-textarea" id="kb-ino-' + mid + '" rows="2" placeholder="Anything else..."></textarea></div>' +
      '<button class="kb-submit" onclick="kbSubmitInfo(\'' + mid + '\',\'' + nextType + '\')">Continue &rarr;</button>' +
      '<button class="kb-cancel" onclick="kbCancelInfo(\'' + mid + '\')">Never mind, I will call instead</button>';
    return f;
  }
  window.kbTogCtx = function (pfx, mid, checked) { var b = document.getElementById('kb-' + pfx + 'ctx-' + mid); if (b) b.style.display = checked ? 'none' : 'block'; };
  window.kbCancelInfo = function (mid) { var f = document.getElementById('kb-info-' + mid); if (f) f.innerHTML = '<p style="color:#333;font-size:12.5px">No problem! Call us at <strong>(847) 251-1200</strong> or email <strong>info@kashianbros.com</strong>!</p>'; flow.active = false; };
  window.kbSubmitInfo = function (mid, nextType) {
    var fn = v('kb-ifn-' + mid), ln = v('kb-iln-' + mid), ph = v('kb-iph-' + mid), em = v('kb-iem-' + mid), ad = v('kb-iad-' + mid);
    var sp = document.getElementById('kb-isp-' + mid).checked;
    var no = v('kb-ino-' + mid);
    var cn = sp ? '' : v('kb-icn-' + mid), cp = sp ? '' : v('kb-icp-' + mid);
    if (!fn || !ln || !ph || !em || !ad) { alert('Please fill in all required fields.'); return; }
    if (!sp && (!cn || !cp)) { alert('Please provide the on-site contact, or check that you will be there yourself.'); return; }
    flow.customerInfo = { fname: fn, lname: ln, phone: ph, email: em, addr: ad, selfP: sp, cname: cn, cphone: cp, notes: no, cardId: mid };
    document.getElementById('kb-info-' + mid).style.display = 'none';
    flowMsg(nextType === 'RUG' ? 'Great! Now tell us about your rugs.\n[SHOW_RUG_SCOPE]' : 'Great! Now pick what needs cleaning.\n[SHOW_SCOPE]');
    setTimeout(function () { scrollNice(document.getElementById('kb-scope-' + (cnt - 1)) || document.getElementById('kb-rugscope-' + (cnt - 1))); }, 150);
  };
  function v(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
  window.kbEditInfo = function (mid) {
    var ic = flow.customerInfo ? document.getElementById('kb-info-' + flow.customerInfo.cardId) : null;
    if (ic) {
      ic.style.display = '';
      var sc = document.getElementById('kb-scope-' + mid) || document.getElementById('kb-rugscope-' + mid);
      if (sc) { var row = sc.closest('.kb-row'); (row || sc).remove(); }
      flow.scope = null; flow.timeChoice = null;
      ic.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };
  // =========================
  // SCOPE FORM (carpet/uphol)
  // =========================
  function buildScopeForm(mid) {
    var f = document.createElement('div'); f.className = 'kb-form'; f.id = 'kb-scope-' + mid;
    f.innerHTML =
      '<div id="kb-sctop-' + mid + '" style="display:none" class="kb-flow-top"></div>' +
      '<div id="kb-scs1-' + mid + '">' +
        '<h3>Tell us about your job</h3>' +
        '<div class="kb-note">Pick the rooms and items you need cleaned.</div>' +
        '<div class="kb-section"><div class="kb-section-hdr" onclick="kbToggleSection(\'kb-sccarpet-' + mid + '\',\'kb-scarrow-' + mid + '\')">Carpet Cleaning <span id="kb-scarrow-' + mid + '">\u2212</span></div>' +
        '<div id="kb-sccarpet-' + mid + '" class="kb-section-body"><div id="kb-sctblc-' + mid + '"></div>' +
        '<div class="kb-addons"><label class="kb-check"><input type="checkbox" id="c-protect-' + mid + '"/> Fiber Protectant <span class="kb-extra-tag">extra</span></label><label class="kb-check"><input type="checkbox" id="c-enzyme-' + mid + '"/> Enzyme Treatment <span class="kb-extra-tag">extra</span></label></div>' +
        '</div></div>' +
        '<div class="kb-section"><div class="kb-section-hdr" onclick="kbToggleSection(\'kb-scuphol-' + mid + '\',\'kb-suarrow-' + mid + '\')">Upholstery Cleaning <span id="kb-suarrow-' + mid + '">\u2212</span></div>' +
        '<div id="kb-scuphol-' + mid + '" class="kb-section-body"><div class="kb-uphol-note">Prices shown are rough estimates. Final quote determined when our crew measures on-site.</div><div id="kb-sctblu-' + mid + '"></div>' +
        '<div class="kb-addons"><label class="kb-check"><input type="checkbox" id="u-protect-' + mid + '"/> Fiber Protectant <span class="kb-extra-tag">extra</span></label><label class="kb-check"><input type="checkbox" id="u-enzyme-' + mid + '"/> Deodorize/Enzyme <span class="kb-extra-tag">extra</span></label><label class="kb-check"><input type="checkbox" id="u-antibac-' + mid + '"/> Antibacterial <span class="kb-extra-tag">extra</span></label></div>' +
        '</div></div>' +
        '<button class="kb-submit" id="kb-scfind-' + mid + '" disabled style="opacity:0.4;cursor:not-allowed" onclick="kbSubmitScope(\'' + mid + '\')">Find Available Times &rarr;</button>' +
        '<div class="kb-duration-box" id="kb-scdur-' + mid + '"><small style="color:#1e40af">Pick at least one room or item to see your job time</small></div>' +
        '<div class="kb-pricing-note"><strong>Pricing:</strong> Final quote given on-site. Want an estimate first? Call <strong>(847) 251-1200</strong> and ask for Adolfo.</div>' +
        '<button class="kb-cancel" onclick="kbCancelScope(\'' + mid + '\')">Never mind, I will call instead</button>' +
      '</div>' +
      '<div class="kb-stage-2" id="kb-scs2-' + mid + '" style="display:none"></div>' +
      '<div class="kb-stage-3" id="kb-scs3-' + mid + '" style="display:none"></div>';
    setTimeout(function () {
      var c = document.getElementById('kb-sctblc-' + mid); if (c) c.appendChild(buildCarpetTable(mid));
      var u = document.getElementById('kb-sctblu-' + mid); if (u) u.appendChild(buildUpholTable(mid));
    }, 50);
    return f;
  }
  window.kbCancelScope = function (mid) { var f = document.getElementById('kb-scope-' + mid) || document.getElementById('kb-rugscope-' + mid); if (f) f.innerHTML = '<p style="color:#333;font-size:12.5px">No problem! Call us at <strong>(847) 251-1200</strong> or email <strong>info@kashianbros.com</strong>!</p>'; flow.active = false; };
  window.kbSubmitScope = function (mid) {
    var mins = calcJobDuration(mid); if (!mins) { alert('Please pick at least one room or upholstery item.'); return; }
    var cL = [], uL = [], uSub = 0;
    Object.keys(CR).forEach(function (k) { var q = getQty(k + '-' + mid); if (q) cL.push(q + 'x ' + CR[k].n); });
    Object.keys(UI).forEach(function (k) { var q = getQty(k + '-' + mid); if (q) { uL.push(q + 'x ' + UI[k].n); uSub += q * UI[k].p; } });
    var lo = Math.max(60, mins - 30), hi = mins + 30;
    flow.scope = { isRug: false, carpetLines: cL, upholLines: uL, cProtect: !!chk('c-protect-' + mid), cEnzyme: !!chk('c-enzyme-' + mid), uProtect: !!chk('u-protect-' + mid), uEnzyme: !!chk('u-enzyme-' + mid), uAntibac: !!chk('u-antibac-' + mid), durationMin: mins, durationLow: lo, durationHigh: hi, upholSubtotal: uSub, cardId: mid };
    flow.service = cL.length && uL.length ? 'both' : cL.length ? 'carpet' : 'upholstery';
    flow.duration = mins;
    advStage2('scope', mid);
    fetchSlots('scope', mid, 'CARPET');
  };
  function chk(id) { var el = document.getElementById(id); return el && el.checked; }
  window.kbEditScope = function (mid) {
    var isRug = !!document.getElementById('kb-rugscope-' + mid);
    var pfx = isRug ? 'kb-rugscope-' : 'kb-scope-';
    var top = document.getElementById(pfx + 'top-' + mid); if (top) top.style.display = 'none';
    var s1 = document.getElementById(pfx + 's1-' + mid); if (s1) s1.style.display = '';
    var s2 = document.getElementById(pfx + 's2-' + mid); if (s2) { s2.style.display = 'none'; s2.innerHTML = ''; }
    var s3 = document.getElementById(pfx + 's3-' + mid); if (s3) { s3.style.display = 'none'; s3.innerHTML = ''; }
    flow.timeChoice = null; flow.scope = null;
    if (!isRug) updateScopeDuration(mid);
  };
  // =========================
  // RUG SCOPE FORM
  // =========================
  function buildRugScopeForm(mid) {
    var f = document.createElement('div'); f.className = 'kb-form'; f.id = 'kb-rugscope-' + mid;
    var PFX = 'rs';
    f.innerHTML =
      '<div id="kb-rugscope-top-' + mid + '" style="display:none" class="kb-flow-top"></div>' +
      '<div id="kb-rugscope-s1-' + mid + '">' +
        '<h3>Tell us about your rugs</h3>' +
        '<div class="kb-note">We pick up, clean at our plant, and deliver back in 7-10 days. Pickup days are <strong>Tuesdays and Thursdays only</strong>.</div>' +
        '<div style="font-size:11px;color:#666;margin-bottom:6px">Enter feet and inches. Rounds up at 6+ inches.</div>' +
        '<div id="kb-rugrows-' + mid + '">' +
          '<div class="kb-rug-row">' +
            '<input class="kb-input" style="width:48px;text-align:center;padding:6px 3px" placeholder="8" id="' + PFX + 'wft1-' + mid + '" data-mid="' + mid + '" data-prefix="' + PFX + '" type="number" min="0" oninput="kbCalcRug(this.dataset.mid,this.dataset.prefix)"/>' +
            '<span style="font-size:10.5px;color:#666">ft</span>' +
            '<input class="kb-input" style="width:44px;text-align:center;padding:6px 3px" placeholder="0" id="' + PFX + 'win1-' + mid + '" data-mid="' + mid + '" data-prefix="' + PFX + '" type="number" min="0" max="11" oninput="kbCalcRug(this.dataset.mid,this.dataset.prefix)"/>' +
            '<span style="font-size:10.5px;color:#666">in \u00d7</span>' +
            '<input class="kb-input" style="width:48px;text-align:center;padding:6px 3px" placeholder="10" id="' + PFX + 'hft1-' + mid + '" data-mid="' + mid + '" data-prefix="' + PFX + '" type="number" min="0" oninput="kbCalcRug(this.dataset.mid,this.dataset.prefix)"/>' +
            '<span style="font-size:10.5px;color:#666">ft</span>' +
            '<input class="kb-input" style="width:44px;text-align:center;padding:6px 3px" placeholder="0" id="' + PFX + 'hin1-' + mid + '" data-mid="' + mid + '" data-prefix="' + PFX + '" type="number" min="0" max="11" oninput="kbCalcRug(this.dataset.mid,this.dataset.prefix)"/>' +
            '<span style="font-size:10.5px;color:#666">in</span>' +
          '</div>' +
        '</div>' +
        '<button type="button" class="kb-cancel" style="width:auto;padding:5px 10px;font-size:11.5px;margin:5px 0" onclick="kbAddRugRow(\'' + mid + '\',\'' + PFX + '\')">+ Add another rug</button>' +
        '<div class="kb-addons" style="margin-top:8px">' +
          '<label class="kb-check"><input type="checkbox" id="' + PFX + 'protect-' + mid + '" data-mid="' + mid + '" data-prefix="' + PFX + '" onchange="kbCalcRug(this.dataset.mid,this.dataset.prefix)"/> Fiber Protectant <span class="kb-extra-tag">$2/sq ft</span></label>' +
          '<label class="kb-check"><input type="checkbox" id="' + PFX + 'enzyme-' + mid + '" data-mid="' + mid + '" data-prefix="' + PFX + '" onchange="kbCalcRug(this.dataset.mid,this.dataset.prefix)"/> Enzyme Treatment <span class="kb-extra-tag">$2/sq ft</span></label>' +
        '</div>' +
        '<button class="kb-submit" id="kb-rugfind-' + mid + '" disabled style="opacity:0.4;cursor:not-allowed" onclick="kbSubmitRugScope(\'' + mid + '\')">Find Available Pickup Times &rarr;</button>' +
        '<div class="kb-price-box" id="kb-rugprice-' + mid + '" style="display:none"></div>' +
        '<div class="kb-duration-box" id="kb-rugdur-' + mid + '"><small style="color:#1e40af">Add at least one rug to see your estimate</small></div>' +
        '<button class="kb-cancel" onclick="kbCancelScope(\'' + mid + '\')">Never mind, I will call instead</button>' +
      '</div>' +
      '<div class="kb-stage-2" id="kb-rugscope-s2-' + mid + '" style="display:none"></div>' +
      '<div class="kb-stage-3" id="kb-rugscope-s3-' + mid + '" style="display:none"></div>';
    return f;
  }
  window.kbSubmitRugScope = function (mid) {
    var fe = document.getElementById('kb-rugscope-' + mid);
    if (!fe || !parseInt(fe.dataset.rc)) { alert('Please add at least one rug.'); return; }
    var PFX = 'rs';
    flow.scope = { isRug: true, rugDesc: fe.dataset.rdesc, rugCount: parseInt(fe.dataset.rc), rugSqft: parseInt(fe.dataset.rs), rugTotal: parseFloat(fe.dataset.rt), rugBase: parseFloat(fe.dataset.rb), rugProtect: parseFloat(fe.dataset.rp), rugEnzyme: parseFloat(fe.dataset.re), cProtect: chk(PFX + 'protect-' + mid), cEnzyme: chk(PFX + 'enzyme-' + mid), durationMin: parseInt(fe.dataset.rd), cardId: mid, carpetLines: [], upholLines: [], upholSubtotal: 0, uProtect: false, uEnzyme: false, uAntibac: false };
    flow.duration = flow.scope.durationMin;
    advStage2('rugscope', mid);
    fetchSlots('rugscope', mid, 'RUG');
  };
  // =========================
  // STAGES 2 + 3
  // =========================
  function infoLine(mid) {
    if (!flow.customerInfo) return '';
    var ci = flow.customerInfo, disp = ci.fname + ' ' + ci.lname + ' \u2014 ' + ci.addr;
    if (disp.length > 62) disp = ci.fname + ' ' + ci.lname + ' \u2014 ' + ci.addr.substring(0, 45) + '...';
    return '<div class="kb-flow-row"><div><span class="kb-flow-check">\u2713</span>' + disp + '</div><button class="kb-flow-edit" onclick="kbEditInfo(\'' + mid + '\')">edit</button></div>';
  }
  function scopeLine(mid) {
    if (!flow.scope) return '';
    var sc = flow.scope, txt = '';
    if (sc.isRug) { txt = sc.rugCount + (sc.rugCount === 1 ? ' rug' : ' rugs') + ' (' + sc.rugSqft + ' sq ft) \u2014 <strong>$' + sc.rugTotal.toFixed(2) + '</strong>'; }
    else { var lines = sc.carpetLines.concat(sc.upholLines); var sum = lines.join(', '); if (sum.length > 55) sum = lines.length + ' items'; txt = '<strong>' + fmtRange(sc.durationLow, sc.durationHigh) + '</strong> \u2014 ' + sum; }
    return '<div class="kb-flow-row"><div><span class="kb-flow-check">\u2713</span>' + txt + '</div><button class="kb-flow-edit" onclick="kbEditScope(\'' + mid + '\')">edit</button></div>';
  }
  function timeLine() { return '<div class="kb-flow-row"><div><span class="kb-flow-check">\u2713</span>' + (flow.timeChoice || '') + '</div></div>'; }
  function advStage2(pfx, mid) {
    var card = document.getElementById('kb-' + pfx + '-' + mid); if (!card) return;
    // Stage 1 / top / Stage 2 IDs differ between the two flows. Resolve them here.
    var s1Id = pfx === 'scope' ? ('kb-scs1-' + mid) : ('kb-rugscope-s1-' + mid);
    var topId = pfx === 'scope' ? ('kb-sctop-' + mid) : ('kb-rugscope-top-' + mid);
    var s2Id = pfx === 'scope' ? ('kb-scs2-' + mid) : ('kb-rugscope-s2-' + mid);
    var s1 = document.getElementById(s1Id); if (s1) s1.style.display = 'none';
    var top = document.getElementById(topId);
    if (top) { top.style.display = 'block'; top.innerHTML = infoLine(mid) + scopeLine(mid); }
    var s2 = document.getElementById(s2Id); if (s2) s2.style.display = 'block';
    // Scroll so the Stage 2 section is at the top of the visible area (above it: just the summary lines)
    scrollNice(s2);
  }
  async function fetchSlots(pfx, mid, type) {
    var s2Id = pfx === 'scope' ? ('kb-scs2-' + mid) : ('kb-rugscope-s2-' + mid);
    var s2 = document.getElementById(s2Id);
    if (!s2) return;
    s2.innerHTML = '<div class="kb-stage-hdr">Pick a time</div><div style="font-size:12.5px;color:#64748b;font-style:italic;padding:6px 0">Checking our schedule...</div>';
    try {
      var r = await fetch(AVAIL_URL + '?duration=' + flow.duration + '&type=' + type);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      var d = await r.json();
      if (d.slots && d.slots.length) {
        var html = '<div class="kb-stage-hdr">Pick a time</div><div class="kb-times-grid">';
        d.slots.slice(0, 4).forEach(function (s) { html += '<button class="kb-time-btn" onclick="kbPickTime(\'' + mid + '\',\'' + s.label.replace(/'/g, "\\'") + '\',\'' + pfx + '\')">' + s.label + '</button>'; });
        html += '</div><button class="kb-time-other" onclick="kbCustomTime(\'' + mid + '\',\'' + pfx + '\')">I have a different time in mind</button>';
        s2.innerHTML = html;
      } else {
        s2.innerHTML = '<div class="kb-stage-hdr">Pick a time</div><div style="font-size:12.5px;color:#475569;padding:6px 0;line-height:1.5">Our schedule is quite full right now. Please call us at <strong>(847) 251-1200</strong>!</div>';
      }
    } catch (e) {
      s2.innerHTML = '<div class="kb-stage-hdr">Pick a time</div><div style="font-size:12.5px;color:#475569;padding:6px 0">Connection error. Please call <strong>(847) 251-1200</strong>.</div>';
    }
  }
  window.kbPickTime = function (mid, label, pfx) {
    flow.timeChoice = label;
    var s2Id = pfx === 'scope' ? ('kb-scs2-' + mid) : ('kb-rugscope-s2-' + mid);
    var topId = pfx === 'scope' ? ('kb-sctop-' + mid) : ('kb-rugscope-top-' + mid);
    var s2 = document.getElementById(s2Id); if (s2) s2.style.display = 'none';
    var top = document.getElementById(topId);
    if (top) top.innerHTML = infoLine(mid) + scopeLine(mid) + timeLine();
    advStage3(pfx, mid);
  };
  window.kbCustomTime = function (mid, pfx) {
    var s2Id = pfx === 'scope' ? ('kb-scs2-' + mid) : ('kb-rugscope-s2-' + mid);
    var s2 = document.getElementById(s2Id); if (!s2) return;
    s2.innerHTML = '<div class="kb-stage-hdr">Pick a time</div><div style="display:flex;flex-direction:column;gap:7px"><label class="kb-label">What date and time works for you?</label><input class="kb-input" id="kb-ct-' + mid + '" placeholder="e.g. Monday May 12 at 10:00 AM"/><button class="kb-submit" onclick="kbSubmitCustomTime(\'' + mid + '\',\'' + pfx + '\')">Use this time</button><button class="kb-cancel" onclick="fetchSlots(\'' + pfx + '\',\'' + mid + '\',\'CARPET\')">&larr; Back</button></div>';
    setTimeout(function () { var inp = document.getElementById('kb-ct-' + mid); if (inp) inp.focus(); }, 80);
  };
  window.kbSubmitCustomTime = function (mid, pfx) { var inp = document.getElementById('kb-ct-' + mid); if (!inp || !inp.value.trim()) { alert('Please enter a date and time.'); return; } kbPickTime(mid, inp.value.trim(), pfx); };
  function advStage3(pfx, mid) {
    var s3Id = pfx === 'scope' ? ('kb-scs3-' + mid) : ('kb-rugscope-s3-' + mid);
    var s3 = document.getElementById(s3Id); if (!s3) return;
    s3.style.display = 'block'; s3.innerHTML = ''; s3.appendChild(buildReviewForm(mid));
    // Scroll so the Stage 3 review section is at the top of the visible area
    scrollNice(s3);
  }
  function buildReviewForm(mid) {
    var div = document.createElement('div');
    var ci = flow.customerInfo || {}, sc = flow.scope || {};
    var html = '<div class="kb-stage-hdr">Review &amp; Submit</div><div class="kb-review-block">';
    if (sc.isRug) {
      html += '<div class="kb-review-line"><span class="kb-review-label">Service</span><span>Rug Pickup &amp; Delivery</span></div>';
      html += '<div class="kb-review-line"><span class="kb-review-label">Rugs</span><span>' + (sc.rugDesc || '') + ' (' + sc.rugSqft + ' sq ft)</span></div>';
      var ra = []; if (sc.cProtect) ra.push('Fiber Protectant'); if (sc.cEnzyme) ra.push('Enzyme');
      if (ra.length) html += '<div class="kb-review-line"><span class="kb-review-label">Add-ons</span><span>' + ra.join(', ') + '</span></div>';
      html += '<div class="kb-review-line"><span class="kb-review-label">Estimate</span><span><strong>$' + sc.rugTotal.toFixed(2) + '</strong> <small style="color:#64748b">($65 min, 7-10 days)</small></span></div>';
    } else {
      var hasC = sc.carpetLines && sc.carpetLines.length, hasU = sc.upholLines && sc.upholLines.length;
      html += '<div class="kb-review-line"><span class="kb-review-label">Service</span><span>' + (hasC && hasU ? 'Carpet &amp; Upholstery Cleaning' : hasC ? 'Carpet Cleaning' : 'Upholstery Cleaning') + '</span></div>';
      if (hasC) { var ca = []; if (sc.cProtect) ca.push('Protectant'); if (sc.cEnzyme) ca.push('Enzyme'); html += '<div class="kb-review-line"><span class="kb-review-label">Carpet</span><span>' + sc.carpetLines.join(', ') + (ca.length ? ' <small style="color:#64748b">+ ' + ca.join(', ') + '</small>' : '') + '</span></div>'; }
      if (hasU) { var ua = []; if (sc.uProtect) ua.push('Protectant'); if (sc.uEnzyme) ua.push('Enzyme'); if (sc.uAntibac) ua.push('Antibacterial'); html += '<div class="kb-review-line"><span class="kb-review-label">Upholstery</span><span>' + sc.upholLines.join(', ') + (ua.length ? ' <small style="color:#64748b">+ ' + ua.join(', ') + '</small>' : '') + '</span></div>'; }
      html += '<div class="kb-review-line"><span class="kb-review-label">Est. time</span><span>' + fmtRange(sc.durationLow, sc.durationHigh) + '</span></div>';
    }
    html += '<div class="kb-review-line"><span class="kb-review-label">When</span><span><strong>' + (flow.timeChoice || '') + '</strong></span></div></div>';
    html += '<div class="kb-review-block">';
    html += '<div class="kb-review-line"><span class="kb-review-label">Name</span><span>' + (ci.fname || '') + ' ' + (ci.lname || '') + '</span></div>';
    html += '<div class="kb-review-line"><span class="kb-review-label">Phone</span><span>' + (ci.phone || '') + '</span></div>';
    html += '<div class="kb-review-line"><span class="kb-review-label">Email</span><span>' + (ci.email || '') + '</span></div>';
    html += '<div class="kb-review-line"><span class="kb-review-label">Address</span><span>' + (ci.addr || '') + '</span></div>';
    html += '<div class="kb-review-line"><span class="kb-review-label">On-site</span><span>' + (ci.selfP ? 'Customer present' : (ci.cname || '') + ' \u2014 ' + (ci.cphone || '')) + '</span></div>';
    if (ci.notes) html += '<div class="kb-review-line"><span class="kb-review-label">Notes</span><span>' + ci.notes.replace(/</g, '&lt;') + '</span></div>';
    html += '</div>';
    if (!sc.isRug) { var subj = []; if (sc.carpetLines && sc.carpetLines.length) subj.push('carpet'); if (sc.upholLines && sc.upholLines.length) subj.push('upholstery'); html += '<div class="kb-pricing-note"><strong>Reminder:</strong> Final quote given on-site once our crew measures. Times may vary based on furniture and condition of your ' + subj.join(' and ') + '.</div>'; }
    html += '<button class="kb-submit" onclick="kbFinalBooking(\'' + mid + '\')">Send Booking Request &#x2713;</button>';
    div.innerHTML = html; return div;
  }
  window.kbFinalBooking = function (mid) {
    var ci = flow.customerInfo; if (!ci) { alert('Missing customer info. Please start over.'); return; }
    var sc = flow.scope || {}, name = (ci.fname + ' ' + ci.lname).trim();
    var svc = 'CARPET', lbl = 'Carpet Cleaning', detail = '', priceInfo = '';
    if (sc.isRug) {
      svc = 'RUG_PICKUP'; lbl = 'Rug Pickup and Delivery'; detail = sc.rugDesc || '';
      priceInfo = 'Rugs: ' + sc.rugDesc + ' (' + sc.rugSqft + ' sq ft) | Base: $' + sc.rugBase.toFixed(2) + (sc.rugProtect > 0 ? ' + Protectant: $' + sc.rugProtect.toFixed(2) : '') + (sc.rugEnzyme > 0 ? ' + Enzyme: $' + sc.rugEnzyme.toFixed(2) : '') + ' | Total: $' + sc.rugTotal.toFixed(2) + ' | Est. pickup: ' + fmtDuration(sc.durationMin);
    } else {
      var hasC = sc.carpetLines && sc.carpetLines.length, hasU = sc.upholLines && sc.upholLines.length;
      if (hasC && hasU) { lbl = 'Carpet & Upholstery Cleaning'; } else if (hasU) { svc = 'UPHOLSTERY'; lbl = 'Upholstery Cleaning'; }
      detail = (sc.carpetLines || []).concat(sc.upholLines || []).join(', ');
      priceInfo = 'Job: ' + detail + ' (Est. ' + fmtDuration(sc.durationMin) + ')' + (sc.upholSubtotal > 0 ? ' | Upholstery subtotal: $' + sc.upholSubtotal.toFixed(2) : '');
    }
    var isChicago = /\bchicago\b/i.test(ci.addr);
    var truck = svc === 'UPHOLSTERY' ? 'Truck 1 preferred' : svc === 'RUG_PICKUP' ? 'Rug Pickup Calendar - Tues and Thurs only' : 'Truck 1 or Truck 2';
    var eb = 'NEW BOOKING - KASHIAN BROS KAY\nSERVICE: ' + lbl + '\nCALENDAR: ' + truck + '\n' + (isChicago ? '*** CHICAGO - Adolfo must book manually ***\n' : '') + '\nName: ' + name + '\nPhone: ' + ci.phone + '\nEmail: ' + ci.email + '\nAddress: ' + ci.addr + (detail ? '\nDetails: ' + detail : '') + (priceInfo ? '\nPrice/Duration: ' + priceInfo : '') + '\nAppointment: ' + (flow.timeChoice || '') + '\nOn-site: ' + (ci.selfP ? 'Customer present' : 'Contact: ' + ci.cname + ' ' + ci.cphone) + (ci.notes ? '\nNotes: ' + ci.notes : '') + '\nSubmitted: ' + new Date().toLocaleString();
    fetch(BOOKING_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name, phone: ci.phone, email: ci.email, addr: ci.addr, svc: svc, lbl: lbl, detail: detail, stairs: '', date: flow.timeChoice || '', time: '', selfP: ci.selfP, cname: ci.cname, cphone: ci.cphone, pets: '', notes: (ci.notes || '') + (priceInfo ? '\nPrice/Duration: ' + priceInfo : ''), isChicago: isChicago, truck: truck, emailBody: eb }) }).catch(function () {});
    var timing = getConfirmTiming();
    var card = document.getElementById('kb-scope-' + mid) || document.getElementById('kb-rugscope-' + mid);
    if (card) {
      card.className = 'kb-success';
      card.innerHTML = '<h3>Booking Request Sent! \u2713</h3><p><strong>Thank you, ' + ci.fname + '!</strong></p><p>Your booking request for <strong>' + lbl + '</strong> has been sent.</p><p style="margin-top:8px;background:#dcfce7;border-radius:6px;padding:8px"><strong>' + timing + '</strong></p><p>Confirmation will go to <strong>' + ci.email + '</strong>. Questions? Call <strong>(847) 251-1200</strong>.</p>' + (isChicago ? '<p style="margin-top:7px;background:#fef9c3;border-radius:6px;padding:8px">Chicago bookings are handled personally by our cleaning manager.</p>' : '');
      scrollNice(card);
    }
    if (ci.cardId) { var ic = document.getElementById('kb-info-' + ci.cardId); if (ic) ic.style.display = 'none'; }
    hist.push({ role: 'user', content: 'BOOKING SUBMITTED: ' + name + ' for ' + lbl + ' on ' + (flow.timeChoice || '') });
    hist.push({ role: 'assistant', content: 'Booking sent! ' + timing });
    flow.scope = null; flow.customerInfo = null; flow.timeChoice = null; flow.active = false;
  };
  // =========================
  // ADD MESSAGE
  // =========================
  function addMsg(role, content, id) {
    var isBot = role === 'assistant';
    var showScope = content.indexOf('[SHOW_SCOPE]') !== -1;
    var showRug = content.indexOf('[SHOW_RUG_SCOPE]') !== -1;
    var infoMatch = content.match(/\[SHOW_INFO_FORM:(CARPET|RUG)\]/);
    var clean = content.replace(/\[SHOW_SCOPE\]/g, '').replace(/\[SHOW_RUG_SCOPE\]/g, '').replace(/\[SHOW_INFO_FORM:(CARPET|RUG)\]/g, '').trim();
    var row = document.createElement('div'); row.className = 'kb-row ' + (isBot ? 'b' : 'u'); row.id = 'kbr' + id;
    var ic = document.createElement('div'); ic.className = 'kb-ic ' + (isBot ? 'b' : 'u'); ic.innerHTML = isBot ? '&#x1F9F9;' : '&#x1F464;';
    var wrap = document.createElement('div'); wrap.style.maxWidth = '100%';
    var bub = document.createElement('div'); bub.className = 'kb-bub ' + (isBot ? 'b' : 'u');
    bub.innerHTML = isBot ? nl2html(clean) : '<p>' + content + '</p>';
    wrap.appendChild(bub);
    if (infoMatch && isBot) wrap.appendChild(buildInfoForm(id, infoMatch[1]));
    if (showScope && isBot) wrap.appendChild(buildScopeForm(id));
    if (showRug && isBot) wrap.appendChild(buildRugScopeForm(id));
    row.appendChild(ic); row.appendChild(wrap);
    msgsEl.appendChild(row); scrollBottom(); cnt++;
  }
  function addTyping() {
    var row = document.createElement('div'); row.className = 'kb-row b'; row.id = 'kb-typing';
    var ic = document.createElement('div'); ic.className = 'kb-ic b'; ic.innerHTML = '&#x1F9F9;';
    var td = document.createElement('div'); td.className = 'kb-typing';
    [0, .2, .4].forEach(function (s) { var d = document.createElement('div'); d.style.animationDelay = s + 's'; td.appendChild(d); });
    row.appendChild(ic); row.appendChild(td); msgsEl.appendChild(row); scrollBottom();
  }
  function removeTyping() { var t = document.getElementById('kb-typing'); if (t) t.remove(); }
  // =========================
  // FLOW
  // =========================
  function flowMsg(text) { hist.push({ role: 'assistant', content: text }); addMsg('assistant', text, cnt); }
  window.kbHandleInput = function (text, btn) {
    if (text === 'Schedule a Pickup') { addMsg('user', text, cnt); hist.push({ role: 'user', content: text }); startRugFlow(); return; }
    if (flow.active) { handleFlowBtn(text); } else { kbSend(text); }
  };
  function handleFlowBtn(text) {
    if (flow.step === 'time_choice') {
      addMsg('user', text, cnt); hist.push({ role: 'user', content: text });
      if (text === 'I have a different time in mind') { flow.step = 'custom_time'; flow.awaitingText = true; flowMsg('What date and time works for you? For example: Monday May 5 at 10:00 AM'); }
      else { flow.active = false; }
    }
  }
  function startCallFlow() {
    addMsg('user', 'Click to Call & Schedule', cnt);
    hist.push({ role: 'user', content: 'Click to Call & Schedule' });
    flowMsg("Calling (847) 251-1200... If your device does not start the call automatically, please dial (847) 251-1200 to reach our team.");
    // Trigger the tel: link to open the phone dialer
    try {
      var callLink = document.createElement('a');
      callLink.href = 'tel:+18472511200';
      callLink.style.display = 'none';
      document.body.appendChild(callLink);
      callLink.click();
      setTimeout(function () { if (callLink && callLink.parentNode) callLink.parentNode.removeChild(callLink); }, 500);
    } catch (e) { /* device may not support tel: links */ }
  }
  function startCarpetFlow() {
    flow = { active: true, type: 'carpet_upholstery', step: 'info', service: null, duration: 0, awaitingText: false, scope: null, customerInfo: null, timeChoice: null };
    addMsg('user', 'Schedule Carpet & Upholstery Cleaning', cnt);
    hist.push({ role: 'user', content: 'Schedule Carpet & Upholstery Cleaning' });
    flowMsg("Happy to help! Let's get you scheduled. First, tell us a bit about you.\n[SHOW_INFO_FORM:CARPET]");
  }
  function startRugFlow() {
    flow = { active: true, type: 'rug', step: 'info', service: 'rug', duration: 0, awaitingText: false, scope: null, customerInfo: null, timeChoice: null };
    addMsg('user', 'Schedule Rug Pickup', cnt);
    hist.push({ role: 'user', content: 'Schedule Rug Pickup' });
    flowMsg("Happy to help with your rug pickup! Let's get you scheduled. First, tell us a bit about you.\n[SHOW_INFO_FORM:RUG]");
  }
  // =========================
  // MAIN MENU
  // =========================
  function showMainButtons() {
    var lastRow = msgsEl.lastElementChild; if (!lastRow) return;
    var bub = lastRow.querySelector('.kb-bub'); if (!bub) return;
    var container = document.createElement('div'); container.style.cssText = 'margin-top:10px;display:flex;flex-direction:column;gap:11px';
    var sections = [
      { t: 'Schedule', b: [{ l: 'Schedule Carpet & Upholstery Cleaning', a: 'carpet' }, { l: 'Schedule Rug Pickup', a: 'rug' }, { l: 'Click to Call & Schedule', a: 'call' }] },
      { t: 'Carpet & Rugs', b: [{ l: 'Custom Carpet', m: 'Tell me about custom carpet' }, { l: 'In-stock Carpets', m: 'Tell me about your in-stock carpets' }, { l: 'Custom Area Rugs', m: 'Tell me about custom area rugs' }, { l: 'Quick Ship Area Rugs', m: 'Tell me about quick ship area rugs' }, { l: 'Custom Stair Runners', m: 'Tell me about custom stair runners' }, { l: 'Rug Repair & Restoration', m: 'Tell me about rug repair and restoration' }, { l: 'Commercial Carpet Cleaning', m: 'Tell me about commercial carpet cleaning' }] },
      { t: 'Hard Surface Flooring', b: [{ l: 'Wood Flooring', m: 'Tell me about wood flooring' }, { l: 'Hardwood Floor Refinishing', m: 'Tell me about hardwood floor refinishing' }, { l: 'Vinyl Flooring', m: 'Tell me about vinyl flooring' }, { l: 'Tile & Backsplash', m: 'Tell me about tile and backsplash' }] },
      { t: 'Kitchen & Bath', b: [{ l: 'Kitchen Remodeling', m: 'Tell me about kitchen remodeling' }, { l: 'Bathroom Remodeling', m: 'Tell me about bathroom remodeling' }, { l: 'Wood Cabinets', m: 'Tell me about wood cabinets' }, { l: 'Cabinet Hardware', m: 'Tell me about cabinet hardware' }, { l: 'Countertops', m: 'Tell me about countertops' }] },
      { t: 'Questions', b: [{ l: 'Rug Cleaning Prices', m: 'I would like to know about rug cleaning prices' }, { l: 'My Dog Had an Accident on My Rug', m: 'My dog had an accident on my rug' }, { l: "I Spilled Red Wine \u2014 What Do I Do?", m: 'I spilled red wine - what do I do?' }, { l: 'How Much Is a Rug Pad?', m: 'How much is a rug pad?' }, { l: 'Ask Another Question', m: 'I have a question' }] }
    ];
    sections.forEach(function (group) {
      var titleEl = document.createElement('div'); titleEl.className = 'kb-menu-title'; titleEl.textContent = group.t; container.appendChild(titleEl);
      var wrap = document.createElement('div'); wrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:5px';
      group.b.forEach(function (b) {
        var btn = document.createElement('button'); btn.className = 'kb-inline-btn'; btn.textContent = b.l;
        btn.onclick = function () {
          if (b.a === 'carpet') startCarpetFlow();
          else if (b.a === 'rug') startRugFlow();
          else if (b.a === 'call') startCallFlow();
          else kbSend(b.m);
        };
        wrap.appendChild(btn);
      });
      container.appendChild(wrap);
    });
    bub.appendChild(container);
  }
  // =========================
  // RUG PAD PRICE CALCULATOR (hard-coded for accuracy)
  // =========================
  // Round each dimension using 6"+ up, 5"- down rule
  function padRound(ft, inches) {
    ft = parseInt(ft) || 0;
    inches = parseInt(inches) || 0;
    return ft + (inches >= 6 ? 1 : 0);
  }
  // Compute the FIRMGRIP pad price for a rug of given rounded dimensions (in feet)
  function calcPadPrice(roundedA, roundedB) {
    var shorter = Math.min(roundedA, roundedB);
    var longer = Math.max(roundedA, roundedB);
    var price;
    if (shorter <= 6) {
      // 6 ft roll x longer side x $2
      price = 6 * longer * 2;
    } else if (shorter <= 12) {
      // 12 ft roll x shorter side x $2
      price = 12 * shorter * 2;
    } else {
      // Oversized rug - no roll fits. Use actual dimensions.
      price = shorter * longer * 2;
    }
    // $48 minimum
    if (price < 48) price = 48;
    return price;
  }
  // Try to extract two rug dimensions from a customer message. Returns {a:{ft,in}, b:{ft,in}} or null.
  // Accepts formats like: 8x10, 8' x 10', 8'7" x 10'2", 6'4" by 9'6", 5 ft 10 in x 9 ft, etc.
  function parsePadDimensions(text) {
    // Normalize quotes and the word "by"
    var s = text.toLowerCase().replace(/[\u2018\u2019\u201C\u201D]/g, "'").replace(/\bby\b/g, 'x').replace(/\u00d7/g, 'x');
    // Patterns to try (in order from most specific to least)
    // Format: 8'7" x 10'2" or 8'7 x 10'2
    var m = s.match(/(\d{1,2})\s*['\u2032]\s*(\d{1,2})\s*(?:["\u2033]|in|inches?)?\s*x\s*(\d{1,2})\s*['\u2032]\s*(\d{1,2})\s*(?:["\u2033]|in|inches?)?/);
    if (m) return { a: { ft: m[1], in: m[2] }, b: { ft: m[3], in: m[4] } };
    // Format: 8' x 10'7"
    m = s.match(/(\d{1,2})\s*['\u2032]\s*x\s*(\d{1,2})\s*['\u2032]\s*(\d{1,2})\s*(?:["\u2033]|in|inches?)?/);
    if (m) return { a: { ft: m[1], in: 0 }, b: { ft: m[2], in: m[3] } };
    // Format: 8'7" x 10' (or 8'7 x 10')
    m = s.match(/(\d{1,2})\s*['\u2032]\s*(\d{1,2})\s*(?:["\u2033]|in|inches?)?\s*x\s*(\d{1,2})\s*['\u2032]?/);
    if (m) return { a: { ft: m[1], in: m[2] }, b: { ft: m[3], in: 0 } };
    // Format: 8 ft 7 in x 10 ft 2 in
    m = s.match(/(\d{1,2})\s*(?:ft|feet|foot|')\s*(\d{1,2})\s*(?:in|inch|inches|")\s*x\s*(\d{1,2})\s*(?:ft|feet|foot|')\s*(\d{1,2})\s*(?:in|inch|inches|")/);
    if (m) return { a: { ft: m[1], in: m[2] }, b: { ft: m[3], in: m[4] } };
    // Format: 8 ft x 10 ft (or just 8x10)
    m = s.match(/(\d{1,2})\s*(?:ft|feet|foot|')?\s*x\s*(\d{1,2})\s*(?:ft|feet|foot|')?/);
    if (m) return { a: { ft: m[1], in: 0 }, b: { ft: m[2], in: 0 } };
    return null;
  }
  // Detect if a message is a rug pad pricing question. Must mention "pad" + cost context.
  function isPadPriceQuestion(text) {
    var s = text.toLowerCase();
    if (!/\bpad\b/.test(s)) return false;
    // Exclude carpet pad questions
    if (/carpet\s+pad/.test(s)) return false;
    // Match price / cost language OR just dimensions (e.g. "8x10 pad" or "pad 8x10")
    return /(price|cost|how\s+much|quote|estimate|charge)/.test(s) || /\d/.test(s);
  }
  // Format dimension for friendly display: 8 ft (rounded)
  function fmtRoundedDim(ft, inches) {
    var r = padRound(ft, inches);
    return r;
  }
  // Build the Kay-style answer for a pad price question with given dimensions
  function buildPadPriceAnswer(dims) {
    var roundedA = padRound(dims.a.ft, dims.a.in);
    var roundedB = padRound(dims.b.ft, dims.b.in);
    if (roundedA === 0 || roundedB === 0) return null;
    var price = calcPadPrice(roundedA, roundedB);
    var shorter = Math.min(roundedA, roundedB);
    var longer = Math.max(roundedA, roundedB);
    // Friendly dimension display - if customer gave inches, echo them, otherwise just the feet
    var aStr = (parseInt(dims.a.in) || 0) > 0 ? dims.a.ft + "'" + dims.a.in + '"' : dims.a.ft + "'";
    var bStr = (parseInt(dims.b.in) || 0) > 0 ? dims.b.ft + "'" + dims.b.in + '"' : dims.b.ft + "'";
    return "For a " + aStr + " x " + bStr + " rug, the pad would be $" + price + ".";
  }

  function kbSend(text) {
    if (!text || !text.trim()) return;
    if (flow.active && flow.awaitingText) {
      flow.awaitingText = false;
      if (flow.step === 'custom_time') {
        addMsg('user', text, cnt); hist.push({ role: 'user', content: text });
        flowMsg('Let me check if that time is available...');
        (async function () {
          try {
            var r = await fetch(AVAIL_URL + '?duration=' + flow.duration + '&type=' + (flow.type === 'rug' ? 'RUG' : 'CARPET'));
            var d = await r.json();
            if (d.slots && d.slots.length) { flowMsg('Sorry, that time is not available. Here are our next open slots:\n[BUTTONS:' + d.slots.slice(0, 4).map(function (s) { return s.label; }).concat(['I have a different time in mind']).join('|') + ']'); flow.step = 'time_choice'; }
            else { flowMsg('Our schedule is quite full. Please call us at (847) 251-1200!'); flow.active = false; }
          } catch (e) { flowMsg('I had trouble checking the schedule. Please call (847) 251-1200!'); flow.active = false; }
        })();
        inpEl.value = ''; return;
      }
    }
    // ----- INTERCEPT: rug pad price questions with dimensions -----
    // If the customer is asking about a rug pad price AND has provided dimensions,
    // compute the answer in code instead of asking Kay. This guarantees correct math.
    // Also fires if customer JUST sends dimensions in a conversation that was just about pads.
    // EXCLUSION: never fire if the message is about cleaning (the customer wants rug cleaning, not pad pricing).
    var isCleaningQuestion = /\b(clean|cleaning|wash|washing|pickup|pick\s*up|delivery|drop[\s-]*off)\b/i.test(text);
    var inPadContext = false;
    if (!isCleaningQuestion) {
      // Look at the last assistant message - if it was about pads (and not cleaning), dimensions alone trigger the calc
      for (var i = hist.length - 1; i >= 0 && i >= hist.length - 4; i--) {
        if (hist[i].role === 'assistant' && /\bpad\b/i.test(hist[i].content) && !/carpet\s+pad/i.test(hist[i].content)) {
          inPadContext = true;
          break;
        }
        if (hist[i].role === 'user' && /\bpad\b/i.test(hist[i].content) && !/carpet\s+pad/i.test(hist[i].content)) {
          inPadContext = true;
          break;
        }
      }
    }
    if (!isCleaningQuestion && (isPadPriceQuestion(text) || (inPadContext && /\d+\s*['\u2032]?\s*(?:\d+\s*(?:["\u2033]|in|inches?)?\s*)?(?:x|\u00d7|by)\s*\d/i.test(text)))) {
      var dims = parsePadDimensions(text);
      if (dims) {
        var answer = buildPadPriceAnswer(dims);
        if (answer) {
          inpEl.value = ''; sbEl.disabled = false;
          addMsg('user', text, cnt); hist.push({ role: 'user', content: text });
          addMsg('assistant', answer, cnt); hist.push({ role: 'assistant', content: answer });
          return;
        }
      }
    }
    inpEl.value = ''; sbEl.disabled = true;
    addMsg('user', text, cnt); hist.push({ role: 'user', content: text });
    addTyping();
    fetch(CHAT_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 800, system: SP + (availCache ? '\n\n' + availCache : ''), messages: hist }) })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var reply = data.content && data.content[0] ? data.content[0].text : "I had trouble with that. Please call (847) 251-1200!";
        removeTyping(); hist.push({ role: 'assistant', content: reply }); addMsg('assistant', reply, cnt);
      }).catch(function () {
        removeTyping(); addMsg('assistant', "I'm having trouble connecting right now. Please call (847) 251-1200 or email info@kashianbros.com!", cnt);
      }).finally(function () { sbEl.disabled = false; });
  }
  window.kbSend = kbSend;
  // =========================
  // EVENTS
  // =========================
  sbEl.onclick = function () { kbSend(inpEl.value); };
  inpEl.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); kbSend(inpEl.value); } });
  // =========================
  // PREFETCH AVAILABILITY
  // =========================
  (async function () { try { var r = await fetch(AVAIL_URL); var d = await r.json(); if (d.summary) availCache = d.summary; } catch (e) {} })();
  // =========================
  // WELCOME + MENU
  // =========================
  addMsg('assistant', "Hi! I'm Kay from Kashian Bros. How can I help you today?", 0);
  showMainButtons();
})();
