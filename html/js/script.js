let configMain = null;
let configHeader = null;
let configFooter = null;
let configServerInfo = null;
let configSidemenuList = null;
let configProfile = null;
let configPartners = null;

let activeCategory = 'all';
let telemetrySource = null;
let radioIntervalId = null;

// アイコン名と SVG コードの辞書（通信0・パースエラー0）
const SVG_DICTIONARY = {
    "android": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--!Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d=\"M131.2 125.9C136.5 125.4 141.8 126.5 146.5 128.9C151.2 131.3 155.1 135.1 157.8 139.7C174.8 169.2 192 198.6 209 228.1C212.5 226.7 216 225.4 219.5 224.2C250.8 213.3 283.7 207.6 316.9 207.3C317.9 207.3 319 207.3 320.1 207.3C358.2 207.3 396.3 214.3 431.7 228.4L483 139.7C484.8 136.5 487.3 133.7 490.2 131.5C493.1 129.3 496.4 127.6 500 126.7C503.1 125.9 506.4 125.6 509.6 125.9C513.8 126.3 517.9 127.6 521.5 129.7C525.5 132.1 528.8 135.4 531.2 139.4C533.2 142.8 534.5 146.6 535 150.6C535.5 154.6 535.1 158.6 533.8 162.3C533.2 164.2532.4 166 531.4 167.8L481.7 253.6C501.2 265.8 519.3 280.1 535.6 296.4C547.9 308.6 559.1 321.8 569.1 335.9C577.3 347.4 584.7 359.5 591.3 372.1C608.8 405.7 619.9 442.6 624 480.2L16 480.2C20.1 442.5 31.2 405.7 48.7 372.1C63.2 344.2 82.1 318.6 104.4 296.4C120.9 280 139.1 265.5 158.9 253.3L109.4 167.9C105.7 161.5 104.7 153.8 106.6 146.7C108.5 139.6 113 133.6 119.3 129.9C122.9 127.7 127 126.4 131.2 126.1zM198.5 341.7C186.3 333.6 168.4 339.2 158.4 354.2C148.4 369.2 150.2 388 162.3 396.1C174.4 404.2 192.4 398.6 202.4 383.6C212.4 368.6 210.6 349.8 198.5 341.7zM482.1 354.2C472.1 339.2 454.2 333.6 442 341.7C429.8 349.8 428.1 368.6 438.1 383.6C448.1 398.6 466 404.2 478.2 396.1C490.4 388 492.1 369.2 482.1 354.2z\"/></svg>",
    "azuracast": "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xml:space=\"preserve\" id=\"Layer_1\" x=\"0\" y=\"0\" version=\"1.1\" viewBox=\"0 0 512 512\"><style>.st0{fill:#0b1b64;fill-rule:evenodd;clip-rule:evenodd}.st4{fill:#1f8df5}</style><path d=\"M256.015.05 477.76 128.01v256.023l-221.745 127.96L34.27 384.033V128.01z\" class=\"st0\"/><path d=\"m257.297 26.438 198.463 114.54V370.06L257.297 484.7 58.934 370.16V140.979z\" class=\"st0\"/><g transform=\"translate(-28.803 -13.716)scale(1.00386)\"><defs><path id=\"SVGID_1_\" d=\"m285 40 197.7 114.1v228.3L285 496.5 87.4 382.4V154.1z\"/></defs><clipPath id=\"SVGID_00000140728964524564752000000014929550898083432362_\"><use xlink:href=\"#SVGID_1_\" style=\"overflow:visible\"/></clipPath><g style=\"clip-path:url(#SVGID_00000140728964524564752000000014929550898083432362_)\"><g transform=\"translate(24.257 24.526)scale(.99615)\"><linearGradient id=\"SVGID_00000038380929061360578930000007690705763142279602_\" x1=\"-45.491\" x2=\"-44.6\" y1=\"641.082\" y2=\"641.082\" gradientTransform=\"scale(-511.4198 511.4198)rotate(-89.932 -343.465 298.495)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" style=\"stop-color:#236be9\"/><stop offset=\"1\" style=\"stop-color:#236be9\"/></linearGradient><path d=\"M-3.2-14.6h543.1v578.3H-3.2z\" style=\"fill-rule:evenodd;clip-rule:evenodd;fill:url(#SVGID_00000038380929061360578930000007690705763142279602_)\"/></g><path d=\"m361.59 87.543-114.387 28.75-8.183-32.557 114.386-28.75zM149.111 121.48l-85.61 81.128-23.092-24.368 85.61-81.128z\" style=\"fill-rule:evenodd;clip-rule:evenodd;fill:#1f8df5\"/><path d=\"M372.582 209.35c-25.945.276-52.668 7.002-76.748 20.905s-43.267 33.682-56.479 56.013c-8.955 15.672-1.097 36.04 16.332 41.28l2.485.667c12.554 3.554 26.136-.987 33.05-11.88 8.349-14.122 19.738-26.099 35.041-34.934 15.078-8.706 31.37-12.71 47.775-12.88 13.15-.09 24.004-9.358 26.813-22.682l.666-2.485c3.05-17.064-10.434-34.184-28.935-34.005\" class=\"st4\"/><path d=\"M396.67 110.225c-50.69-4.641-103.244 6.197-150.73 33.612-47.484 27.416-82.697 67.25-104.473 113.729-7.44 15.698.54 34.196 17.258 39.246l2.035.926c14.009 4.514 28.871-1.966 34.71-15.24 16.862-35.24 43.767-66.076 80.225-87.125s76.616-28.931 115.115-25.654c14.415 1.58 27.328-8.276 30.553-22.44l.216-2.225c4.245-16.554-7.915-32.938-24.91-34.829\" class=\"st4\"/><path d=\"M418.861 12.496c-74.723-9.37-152.694 4.74-222.683 45.149S75.113 158.748 45.735 227.919c-6.28 15.629 1.44 33.677 17.448 38.537l2.485.666c14.269 4.964 29.511-2.936 35.22-16.434 24.145-57.449 66.982-107.986 125.044-141.508s122.667-45.316 185.07-37.536c14.6752.03 29.008-7.446 31.843-22.285l.666-2.485c3.215-16.26-7.975-32.003-24.65-34.378\" class=\"st4\"/></g></g><path d=\"M138.9 31.9c-1.8-1.5-4.2-1.8-6.4-1.3L86 42.4c-3.3.9-5.6 3.8-5.6 7.1v55.3c-2.5-1.1-5.5-1.6-8.7-1.6-10 0-17.8 6.2-17.8 13.8s7.8 13.8 17.8 13.8 17.8-6.2 17.8-13.8V65.4l42.9-10.9v36.9c-2.5-1.1-5.5-1.6-8.7-1.6-10 0-17.8 6.2-17.8 13.8s7.8 13.8 17.8 13.8 17.8-6.2 17.8-13.8V37.7c.3-2.3-.8-4.5-2.6-5.8\" style=\"fill:#0b1b64\" transform=\"translate(-160.672 -94.206)scale(4.21541)\"/></svg>",
    "bookstack": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--!Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d=\"M480 576L192 576C139 576 96 533 96 480L96 160C96 107 139 64 192 64L496 64C522.5 64 544 85.5 544 112L544 400C544 420.9 530.6 438.7 512 445.3L512 512C529.7 512 544 526.3 544 544C544 561.7 529.7 576 512 576L480 576zM192 448C174.3 448 160 462.3 160 480C160 497.7 174.3 512 192 512L448 512L448 448L192 448zM224 216C224 229.3 234.7 240 248 240L424 240C437.3 240 448 229.3 448 216C448 202.7 437.3 192 424 192L248 192C234.7 192 224 202.7 224 216zM248 288C234.7 288 224 298.7 224 312C224 325.3 234.7 336 248 336L424 336C437.3 336 448325.3 448 312C448 298.7 437.3 288 424 288L248 288z\"/></svg>",
    "home": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--!Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d=\"M341.8 72.6C329.5 61.2 310.5 61.2 298.3 72.6L74.3 280.6C64.7 289.6 61.5 303.5 66.3 315.7C71.1 327.9 82.8 336 96 336L112 336L112 512C112 547.3 140.7 576 176 576L464 576C499.3 576 528 547.3 528 512L528336L544 336C557.2 336 569 327.9 573.8 315.7C578.6 303.5 575.4 289.5 565.8 280.6L341.8 72.6zM304 384L336 384C362.5 384 384 405.5 384 432L384 528L256 528L256 432C256 405.5 277.5 384 304 384z\"/></svg>",
    "instagram": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--!Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d=\"M320.3 205C256.8 204.8 205.2 256.2 205 319.7C204.8 383.2 256.2 434.8 319.7 435C383.2435.2 434.8 383.8 435 320.3C435.2 256.8 383.8 205.2 320.3 205zM319.7 245.4C360.9 245.2 394.4 278.5 394.6 319.7C394.8 360.9 361.5 394.4 320.3 394.6C279.1 394.8 245.6 361.5 245.4 320.3C245.2 279.1 278.5 245.6 319.7 245.4zM413.1 200.3C413.1 185.5 425.1 173.5 439.9 173.5C454.7 173.5 466.7 185.5 466.7 200.3C466.7 215.1 454.7 227.1 439.9 227.1C425.1 227.1 413.1 215.1 413.1 200.3zM542.8 227.5C541.1 191.6 532.9 159.8 506.6 133.6C480.4 107.4 448.6 99.2 412.7 97.4C375.7 95.3 264.8 95.3 227.8 97.4C192 99.1 160.2 107.3 133.9 133.5C107.6 159.7 99.5 191.5 97.7 227.4C95.6 264.4 95.6 375.3 97.7 412.3C99.4 448.2 107.6 480 133.9 506.2C160.2 532.4 191.9 540.6 227.8 542.4C264.8 544.5 375.7 544.5 412.7 542.4C448.6 540.7 480.4 532.5 506.6 506.2C532.8 480 541 448.2 542.8 412.3C544.9 375.3 544.9 264.5 542.8 227.5zM495 452C487.2 471.6 472.1 486.7 452.4 494.6C422.9 506.3 352.9 503.6 320.3 503.6C287.7 503.6 217.6 506.2 188.2 494.6C168.6 486.8 153.5 471.7 145.6 452C133.9 422.5 136.6 352.5 136.6 319.9C136.6 287.3 134 217.2 145.6 187.8C153.4 168.2 168.5 153.1 188.2 145.2C217.7 133.5 287.7 136.2 320.3 136.2C352.9136.2 423 133.6 452.4 145.2C472 153 487.1 168.1 495 187.8C506.7 217.3 504 287.3 504 319.9C504 352.5 506.7 422.6 495 452z\"/></svg>",
    "mastodon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--!Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d=\"M529 243.1C529 145.9 465.3 117.4 465.3 117.4C402.8 88.7 236.7 89 174.8 117.4C174.8 117.4 111.1 145.9 111.1 243.1C111.1 358.8 104.5 502.5 216.7 532.2C257.2 542.9 292 545.2 320 543.6C370.8 540.8 399.3 525.5 399.3 525.5L397.6 488.6C397.6 488.6 361.3 500 320.5 498.7C280.1 497.3 237.5 494.3 230.9 444.7C230.3 440.1 230 435.4 230 430.8C315.6 451.7 388.7 439.9 408.7 437.5C464.8 430.8 513.7 396.2 519.9 364.6C529.7 314.8 528.9 243.1 528.9 243.1zM453.9 368.3L407.3 368.3L407.3 254.1C407.3 204.4 343.3 202.5 343.3 261L343.3 323.5L297323.5L297 261C297 202.5 233 204.4 233 254.1L233 368.3L186.3 368.3C186.3 246.2 181.1 220.4 204.7 193.3C230.6 164.4 284.5 162.5 308.5 199.4L320.1 218.9L331.7 199.4C355.8 162.3 409.8 164.6 435.5 193.3C459.2 220.6 453.9 246.3 453.9 368.3L453.9 368.3z\"/></svg>",
    "mattermost": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--!Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d=\"M326.9 64.1L291.9 105.5C227 117.2 171 161.5 149 226.5C116.3 323.1 171.2 429.1 271.6463.1C372 497.1 480 446.2 512.7 349.5C534.6 284.7 517.2 215.8 473.2 167.2L470.5 112.9C558.8 177 599.3 293.3 562.5 402.1C517.1 536 371.8 607.7 238 562.4C104.2 517.1 32.3 371.8 77.6 237.9C114.5 129 217.6 61.1 326.9 64.1zM398.7 87.7C400.1 88.2 401.2 89.2 401.9 90.4C401.9 90.5 402 90.5 402.1 90.6C402.2 90.7 402.2 90.8 402.2 90.9C402.5 91.5 402.8 92.3 403 93.2C403.6 97.5 403.4 115.3 403.4 115.7L404.4 153.6L405.9 197.3L407.8 273.3C407.8 274 408.3 308.5 384.4 332C360.2 355.7 330.4 353.6 311.1 347C291.8 340.4 266.8 324.1 261.9 290.5C257 256.9 278.9 229.7 278.9 229.7L326.4 170.3L354.1 136.5L378 107C378.2 106.7 389 92.3 392 89.3C392.6 88.7 393.3 88.3 393.9 88C394 87.9 394.2 87.8 394.3 87.8L394.4 87.8C395.7 87.2 397.2 87.1 398.7 87.6z\"/></svg>",
    "misskey": "<svg xmlns=\"http://www.w3.org/2000/svg\" xml:space=\"preserve\" viewBox=\"0.01 76.52 512 358.88\"><path d=\"M62.475 76.577a61.9 61.9 0 0 0-21.352 3.731c-12.118 4.26-22.093 11.933-29.899 22.966C3.737 113.964.006 125.87.006 139.046v233.893c0 17.092 6.06 31.856 18.15 44.318 12.463 12.118 27.253 18.15 44.319 18.15 17.462 0 32.226-6.058 44.318-18.15 12.462-12.462 18.68-27.252 18.68-44.344v-42.52c.132-9.207 9.63-6.8 14.42 0 8.969 15.558 28.019 28.92 50.19 28.84 22.173-.079 40.588-11.033 50.193-28.84 3.651-4.286 13.89-11.615 14.949 0v42.52c0 17.092 6.059 31.856 18.15 44.318 12.489 12.118 27.253 18.15 44.318 18.15 17.436 0 32.227-6.059 44.318-18.15 12.462-12.462 18.68-27.253 18.68-44.345V138.993c0-13.176-3.916-25.083-11.748-35.772-7.487-11.06-17.277-18.706-29.369-22.966q-10.675-3.73-21.352-3.73c-19.235 0-35.427 7.487-48.604 22.436l-63.368 74.243c-1.429 1.085-6.138 9.234-16.166 9.234-10.001 0-14.182-8.15-15.61-9.208l-63.95-74.216C97.716 84.065 81.71 76.577 62.473 76.577m395.078.027c-14.95 0-27.782 5.344-38.444 16.007-10.32 10.319-15.479 22.966-15.479 37.915 0 14.95 5.16 27.782 15.479 38.444 10.662 10.32 23.495 15.479 38.444 15.479s27.755-5.16 38.444-15.479c10.663-10.662 16.007-23.495 16.007-38.444s-5.344-27.596-16.007-37.915c-10.69-10.663-23.495-16.007-38.444-16.007m.503 118.534c-14.95 0-27.782 5.345-38.445 16.007-10.662 10.69-16.007 23.495-16.007 38.444v131.896c0 14.95 5.345 27.782 16.007 38.444 10.69 10.32 23.496 15.479 38.445 15.479s27.596-5.16 37.915-15.479c10.662-10.662 16.007-23.495 16.007-38.444V249.59c0-14.949-5.345-27.78-16.007-38.444-10.32-10.662-22.94-16.007-37.915-16.007\"/></svg>",
    "motorcycle": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--!Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d=\"M280 80C266.7 80 256 90.7 256 104C256 117.3 266.7 128 280 128L336.6 128L359.1 176.7L264 248C230.6 222.9 189 208 144 208L88 208C74.7 208 64 218.7 64 232C64 245.3 74.7 256 88 256L144 256C222.5 256 287.2 315.6 295.2 392L269.8 392C258.6 332.8 206.5 288 144 288C73.3 288 16 345.3 16 416C16 486.7 73.3 544 144544C206.5 544 258.5 499.2 269.8 440L320 440C333.3 440 344 429.3 344 416L344 393.5C344 348.4 369.7 308.1 409.5285.8L421.6 311.9C389.2 335.1 368.1 373.1 368.1 416C368.1 486.7 425.4 544 496.1 544C566.8 544 624.1 486.7 624.1 416C624.1 345.3 566.8 288 496.1 288C485.4 288 475.1 289.3 465.2 291.8L433.8 224L488 224C501.3 224 512 213.3512 200L512 152C512 138.7 501.3 128 488 128L434.7 128C427.8 128 421 130.2 415.5 134.4L398.4 147.2L373.8 93.9C369.9 85.4 361.4 80 352 80L280 80zM445.8 364.4L474.2 426C479.8 438 494 443.3 506 437.7C518 432.1 523.3 417.9 517.7 405.9L489.2 344.3C491.4 344.1 493.6 344 495.9 344C535.7 344 567.9 376.2 567.9 416C567.9 455.8 535.7 488 495.9 488C456.1 488 423.9 455.8 423.9 416C423.9 395.8 432.2 377.5 445.7 364.4zM144 488C104.2 488 72 455.8 72 416C72 376.2 104.2 344 144 344C175.3 344 202 364 211.9 392L144 392C130.7 392 120 402.7 120 416C120 429.3 130.7 440 144 440L211.9 440C202 468 175.3 488 144 488z\"/></svg>",
    "nextcloud": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--!Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d=\"M327.8 468.7C337.8 468.7 344.2 472.9 347.1 475.3C348.4 476.4 348.7 477.7 347.3 479.3L346.5 480.6C345.4 482.2 344.1 482.2 342.5 481.1C339.9 479.2 334.8 475.8 328 475.8C315.3 475.8 305.3 485.3 305.3 499.3C305.3 513 315.3 522.5 328 522.6C336.2 522.6 341.7 518.9 344.4 516.5C346 515.4 347.1 515.7 348.1 517.3L348.9 518.4C349.7 520 349.4 521 348.1 522.4C345.2 524.8 338 529.8 327.5 529.8C310.3 529.8 297.1 517.4 297.1 499.4C297.4 481.4 310.6 468.7 327.8 468.7zM163.6 468.7C179.2 468.7 187.9 479.8 187.9 496.5C187.9 498.1 186.6 499.4 185 499.4L143 499.4C143.3 514.2 153.6 522.6 165.5 522.7C172.9 522.7 178.2 519.5 180.8 517.4C182.4 516.3 183.7 516.6 184.5 518.2L185.3 519.5C186.1 520.8 185.8 522.1 184.5 523.2C181.3 525.6 174.5 529.5 165.2 529.5C148 529.5 134.8 517.1 134.8 499.1C135.1 480.1 147.8 468.7 163.6 468.7zM417.2 468.7C434.1 468.7 447.9 481.7 447.9 498.8C447.9 516.2 434.2 529.4 417.2 529.5C400.2 529.6 386.5 516.3 386.5 498.8C386.5 481.6 400.3 468.7 417.2 468.7zM465.5 470C467.3 470 468.4 471.1 468.4 472.9L468.4 504.9C468.4 513.9 474.5 522.1 485.6 522.1C497 522.1 502.8 513.9 502.8 504.9L502.8 472.9C502.8 471.1 503.9 470 505.7 470L507.8 470C509.6 470 510.7 471.1 510.4 472.9L510.4 507C510.4 522.1 499.3 529.5 485.6 529.5C471.9 529.5 460.8 522.1 460.8 507L460.8 472.9C460.8 471 461.6 470 463.5 470L465.6 470zM571.3 446.8C573.1 446.8 576 447.9 576 449.7L576 525C576 526.8 575.2 527.9 573.4 527.9L571.5 527.9C569.7 527.9 568.6 527.1 568.6 525.3L568.6 520.8C568.6 518.7 569.1 517.1 569.1 517.1L568.8 517.1C568.8517.1 563.8 529.3 548.7 529.3C533.1 529.3 523.3 516.9 523.3 498.9C522.8 480.9 533.6 468.8 548.9 468.8C562.9 468.8 567.9 480.4 567.9 480.4L568.2 480.4C568.2 480.4 567.9 478.5 567.9 475.9L567.9 449.7C567.9 447.9 567.1 446.8 569 446.8L571.1 446.8zM365.9 447C367.7 447 370.6 448.1 370.6 449.9L370.6 513.1C370.6 520.5 374 521.3 376.7 521.5C378 521.5 379.1 522.3 379.1 524.2L379.1 526C379.1 527.8 378.3 528.9 376.2 528.9C371.4 528.9 363 527.3 363 514.6L363 449.9C363 448.5 362.4 447.6 362.9 447.2L363.8 447L365.9 447zM246.2 469.6C246.8 469.5 247.5 469.7 248.2 470.3L249.8 471.6C251.2 472.8 251.3 474.3 250.1 475.7L243.5 483.5L243.5 483.5L230.5 499C236.1 505.7 242.6513.5 250.1 522.3C251.3 523.7 251.4 525 249.9 526.2L248.3 527.5C246.9 528.7 245.4 528.6 244.2 527.2L237.6 519.4L237.6 519.4L225.5 504.9C220.6 510.7 214.4 518.2 206.8 527.2C205.6 528.6 204.3 528.9 202.9 527.7L201.3 526.4C199.9 525.2 199.8 523.7 201 522.3L207.6 514.5L207.6 514.5L220.6 499L211.8 488.4L201.1 475.7C199.9 474.3 199.8473 201.3 471.8L202.9 470.4C203.6 469.8 204.3 469.6 205 469.6C205.7 469.7 206.4 470 207 470.8C210.5 474.9 216.7 482.4 225.7 493.1C230.6 487.3 236.8 479.9 244.4 470.8C245 470.1 245.6 469.7 246.3 469.6zM271 453.9C272.9 453.9 273.7 455 273.7 456.8L273.7 470.6L285.6 470.6C287.4 470.6 288.5 471.7 288.5 473.5L288.5 474.3C288.5 476.1 287.4 477 285.6 477L273.7 477L273.7 506.1C273.7 519.6 281.9 521.2 286.4 521.4C288.8 521.7 289.6 522.2 289.6 524.3L289.6 525.9C289.6 527.7 288.8 528.5 286.4 528.5C273.7 528.5 266.1 520.8 266.1 507.1L266.1 456.9C266.1 455.1 267.2 454 269 454L271.1 454zM68.8 445.7C69.9 445.7 70.7 446.1 71.1 446.8C71.3 447 71.4 447.1 71.6 447.3L113.4 512.2L113.4 448.5C113.4 446.7 114.5 445.6 116.3 445.6L118.4 445.6C120.2 445.6 121 446.7 121 448.5L121 525.2C121 527 120.2 528.1 118.4 528.1L116.3 528.1C115.9 528.1 115.7 528 115.4 527.9C115.3 527.9 115.2 527.9 115.1 527.9C115 527.9 114.9 527.8 114.8 527.7C114.6 527.6 114.4 527.5 114.2 527.4C114.1 527.3 114.1 527.3 114 527.2C113.8 527 113.6 526.8 113.4 526.5L71.6 461.6L71.6 525.3C71.6 527.1 70.6 528.2 68.7 528.2L66.6 528.2C64.8 528.2 63.9 527.2 63.9 525.3L63.9 448.6C63.9 446.8 64.7 445.7 66.6 445.7L68.7 445.7zM417.2 475.8C404.8 475.8 394.5 485.8 394.5 498.8C394.8 512.3 404.8 522.6 417.2 522.6C429.6 522.6 439.7 512.6 439.7 498.8C439.7 485.6 429.6 475.8417.2 475.8zM549.6 475.8C539.3 475.8 530.9 484.3 530.9 499C531.2 513.3 538.6 522.5 549.4 522.5C559.2 522.5 568.2 515.6 568.2 499C568.2 487.1 562.1 475.8 549.7 475.8zM163.4 475.3C153.6 475.3 145.2 481.7 143.3 493.5L179.8493.5C179.3 481.3 171.9 475.3 163.4 475.3zM320.5 110.4C386.3 110.4 442.3 154.7 460.2 214.9C475.6 183.3 508 161.3 545.3 161.3C597.3 161.3 640 204 640 256C640 308 597.2 350.7 545.3 350.7C508 350.7 475.6 328.7 460.2 297.1C442.3 357.3 386.4 401.7 320.5 401.7C254.2 401.7 197.9 356.7 180.5 295.8C165.4 328.1 132.5 350.8 94.7 350.8C42.7 350.8 0 308 0 256.1C0 204.2 42.7 161.3 94.7 161.3C132.5 161.3 165.3 183.9 180.5 216.3C197.9 155.4 254.2 110.4 320.5 110.4zM320.5 166C270.7 166 230.4 206.3 230.4 256.1C230.4 305.9 270.7 346.2 320.5 346.2C370.3 346.2 410.6 305.9 410.6 256.1C410.6 206.3 370.3 166 320.5 166zM94.7 217C73.1 217 55.6 234.6 55.6 256.2C55.6 277.8 73.2 295.3 94.8 295.3C116.4 295.3 133.9 277.7 133.9 256.1C133.9 234.5 116.3 217 94.7 217zM545.2 217C523.6 217 506.1234.5 506.1 256.2C506.1 277.8 523.6 295.3 545.2 295.3C566.8 295.3 584.4 277.8 584.4 256.2C584.4 234.5 566.8 217 545.2 217z\"/></svg>",
    "owncast-dark": "<svg xmlns=\"http://www.w3.org/2000/svg\" xml:space=\"preserve\" viewBox=\"0 0 512 512\"><path d=\"M486.3 385.4c5.3-14.3 5.5-27.4.7-39.2-4.4-11-13-20.2-25.6-27.7-11.8-6.8-26-11.8-42.7-14.8-15.1-2.7-31.8-4-49.6-3.6-17.2.5-33.9 2.4-50.1 5.6-15.6 3.2-29.1 7.3-40.9 12.3-11.6 4.9-20.7 10.3-27.2 16.1-6.5 6.2-9.9 12.4-10.2 18.9-.5 7.7 3.4 16 11.8 24.9 7.7 8.1 18.4 16.2 32.3 24 13.8 7.8 29.1 14.6 45.9 20.3 18 6 35.6 9.8 5311.5 11.3 1 21.7 1.1 31.4.5 10.6-1 20.4-3.2 29.5-6.7q14.55-5.7 24.9-15.6c7.4-7.2 13.1-16 16.8-26.5m-107-40.1c5.8 3 10 6.8 12.8 11.3 2.7 4.9 3.3 10.6 1.8 16.9-1.1 4.4-3.1 8.3-5.8 11.5q-3.9 4.35-10.2 6.9c-3.6 1.6-7.9 2.6-13.1 3.3-4.9.5-9.9.6-14.8.2-8.7-.5-18.3-2.2-28.6-5.1-9.1-2.7-17.8-6.2-26.1-10.2-7.7-3.8-14-7.7-18.9-11.8-4.8-4.3-7.1-8-6.9-11.3.3-2.7 2.3-5.3 5.8-7.9 3.6-2.4 8.6-4.5 14.8-6.4 6.3-2.1 13.3-3.6 21-4.6 8.7-1 17-1.6 24.9-1.68.7.2 16.5.8 23.5 2.1 7.4 1.6 14.1 3.8 19.8 6.7M358.8 76.8c-.7-18.4-5.3-33.7-13.8-46.1C336 17.2 322.7 8 305 3c-4-1.1-8.1-2.1-12.5-2.6-4-.5-7.9-.6-12-.2-3.8 0-7.5.4-11.3 1.3q-4.8 1.05-10.8 3.3c-12.6 4.9-24 13.7-34.3 26.1-9.6 11.3-17.8 25.3-24.5 42-6 14.2-10.8 29.7-14.3 46.6-3.4 15.9-5.7 32-6.9 48.4-1 14.8-1.1 29.1-.2 42.7 1 13.52.9 25.7 5.6 36.6 5.4 22.4 13.8 36.1 25.1 41.3 1 .5 2.1.9 3 1.3l6.7 1c.8 0 2.1-.1 3.9-.2q10.8-1.05 24.3-9c8.7-5.3 17.9-12.5 27.4-21.7 10.2-9.9 20.2-21.4 29.7-34.6 10-13.7 19-28.1 26.8-43.2 9.2-18 16.3-35.5 21.2-52.8 5.2-19 7.5-36.6 6.9-52.5m-97.5 41.4c1.7.3 3.1.7 4.4 1.3 13.8 4.8 20.9 15.8 21.2 33 .2 14.2-4.2 30.5-13.1 48.9-7.315.4-16.1 28.8-26.3 40.4-9.6 11-17.5 16.7-24 17.4l-1.3.2-2.3-.2-1.3-.5c-4.8-2.2-8.1-9.5-10-21.7-1.9-12.4-1.8-26.7.2-42.7 2.2-18 6.4-33.6 12.5-47.1 7.3-16.1 16.4-25.5 27.2-28.4 1.9-.5 3.2-.7 4.1-.7 1.4-.2 2.7-.2 4.1-.2 1.3-.1 2.9 0 4.6.3M31.7 171.7q-3.15 4.05-5.1 9c-1.6 4-2.6 7.9-3.3 12-3.6 16.7-1.7 32.9 5.8 48.7q9.3 19.5 29.7 36.6c12.1 10 25.8 18.3 40.9 24.5 15.4 6.3 28.7 9.2 40.2 8.7 2.2 0 4.6-.2 7.2-.7s4.7-1.1 6.4-2.1c1.7-.8 3.3-2 4.9-3.3s2.7-2.9 3.6-4.6c4.1-7.8 3-20-3.3-36.4-6.5-15.9-16.3-32.2-29.5-48.9-13.7-17.4-27.9-31.1-42.7-41.3-16.1-10.8-29.6-14.7-40.7-12-2.7.7-5.3 1.9-7.7 3.6-2.3 1.6-4.5 3.7-6.4 6.2m37.9 51c.8-1.6 1.7-2.7 2.6-3.6.8-.8 1.9-1.73-2.3 1.4-.5 2.6-.8 3.6-1 5.4-1 12.3 1.4 20.8 7.2 7.5 4.9 15 11.9 22.6 21 6.8 8.1 12.3 16.2 16.4 24 4 8 5.1 13.7 3.6 16.9-.3.7-.7 1.1-1.3 1.6-.5.7-1.1 1.1-1.8 1.3-.3.3-1 .6-2.1.7l-2.8.5c-5.4.3-12.5-1.1-21.2-4.6-8.6-3.4-16.5-7.9-24-13.6-8-6-14-12.4-18-19.4-4.4-8-5.4-16.1-3-24 .3-1.8.9-3.4 1.6-4.7m127.2 156.9h-1c-5.3-.2-10.1 1.7-14.6 5.3-4.1 3.6-7.6 8.7-10.4 15.4-2.6 6-4.4 12.7-5.3 20.3-1 7.5-1.1 15.1-.5 22.8 1.4 16.2 6.2 30 14.3 41.3 9.6 13 22.9 21.5 39.9 25.6h.5l1.6.5h.7c18.6 3.6 31 .1 37.4-10.4 2.9-4.9 4.4-11.3 4.4-18.9-.2-7.3-1.6-15.4-4.1-24-2.6-8.9-6.2-17.8-10.8-26.6-4.6-9.1-9.8-17.2-15.6-24.5-6.2-7.7-12.3-13.8-18.4-18.4-6.7-5.3-12.6-7.9-18.1-8.4m-7.2 31.7c2.7-7.5 6.3-11.1 10.4-10.8h.2c4.3.5 9.3 4.9 15.1 13.3s10.1 17.1 13.1 26.3c3.2 10 4 18.1 2.1 24-2.2 6.3-7.7 8.9-16.4 7.7h-.1l-.2-.2h-.8c-8.6-1.7-15.1-6.2-19.7-13.3-4-6.5-6.2-14.3-6.7-23.5-.5-9 .5-16.8 3-23.5m-55.6-55c-1.6-1.1-3.4-2.2-5.6-3s-4.5-1.5-6.9-1.8c-2.2-.5-4.6-.8-7.2-1-7.3-.2-14.5.9-21.5 3.3-6.8 2.2-12.3 5.5-16.610-4.3 4.8-6.3 10-6.2 15.9.2 6.3 3.1 13.2 9 20.5 1.6 1.9 3.4 4 5.6 6.2 1.7 1.7 3.7 3.2 5.8 4.6 1.7 1 3.6 2 5.6 2.8 2.4.8 4.3 1.3 5.6 1.3 6.2.8 12.1-.4 18-3.9 5.6-3.2 10.4-7.8 14.6-13.8 4.3-6.2 6.9-12.4 7.9-18.9 1-7.2-.2-13.1-3.9-17.7-1.1-1.9-2.6-3.4-4.2-4.5m-5.1 10.4c1.6 2.1 1.9 4.8 1 8.1-.7 3.2-2.2 6.6-4.6 10-2.4 3.2-5.1 5.8-8.1 7.7-3.2 2.1-6.4 2.9-9.5 2.6l-2.8-.5c-1-.3-2-.8-2.8-1.6-.7-.3-1.7-1-2.8-2.1-.7-.7-1.6-1.7-2.6-2.8-3-4-4.3-7.5-3.6-10.8.3-2.9 2.1-5.4 5.3-7.7 2.9-2.1 6.4-3.6 10.4-4.6 4.1-1 8-1.5 11.8-1.3l2.8.2 2.3.5c.7.3 1.3.7 1.8 1z\"/></svg>",
    "pixelfed": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--!Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d=\"M320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320C64 178.6 178.6 64 320 64zM299.7 375.9L346.7 375.9C390.9 375.9 426.8 341 426.8 297.9C426.8 254.8 390.9 219.9 346.7 219.9L278.9 219.9C253.4 219.9 232.7 240 232.7 264.9L232.7 440L299.7 375.9z\"/></svg>",
    "server": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--!Font Awesome Free 7.3.1by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d=\"M160 96C124.7 96 96 124.7 96 160L96 224C96 259.3 124.7 288 160 288L480 288C515.3 288 544 259.3 544 224L544 160C544 124.7 515.3 96 480 96L160 96zM376 168C389.3 168 400 178.7 400 192C400 205.3 389.3 216 376 216C362.7 216 352 205.3 352 192C352 178.7 362.7 168 376 168zM432 192C432 178.7 442.7 168 456 168C469.3168 480 178.7 480 192C480 205.3 469.3 216 456 216C442.7 216 432 205.3 432 192zM160 352C124.7 352 96 380.7 96 416L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 416C544 380.7 515.3 352 480 352L160 352zM376 424C389.3 424 400 434.7 400 448C400 461.3 389.3 472 376 472C362.7 472 352 461.3 352 448C352 434.7362.7 424 376 424zM432 448C432 434.7 442.7 424 456 424C469.3 424 480 434.7 480 448C480 461.3 469.3 472 456 472C442.7 472 432 461.3 432 448z\"/></svg>",
    "twitter": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--!Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d=\"M523.4 215.7C523.7 220.2 523.7 224.8 523.7 229.3C523.7 368 418.1 527.9 225.1 527.9C165.6 527.9 110.4 510.7 64 480.8C72.4 481.8 80.6 482.1 89.3 482.1C138.4 482.1 183.5 465.5 219.6 437.3C173.5 436.3134.8 406.1 121.5 364.5C128 365.5 134.5 366.1 141.3 366.1C150.7 366.1 160.1 364.8 168.9 362.5C120.8 352.8 84.8 310.5 84.8 259.5L84.8 258.2C98.8 266 115 270.9 132.2 271.5C103.9 252.7 85.4 220.5 85.4 184.1C85.4 164.6 90.6146.7 99.7 131.1C151.4 194.8 229 236.4 316.1 240.9C314.5 233.1 313.5 225 313.5 216.9C313.5 159.1 360.3 112 418.4 112C448.6 112 475.9 124.7 495.1 145.1C518.8 140.6 541.6 131.8 561.7 119.8C553.9 144.2 537.3 164.6 515.6 177.6C536.7 175.3 557.2 169.5 576 161.4C561.7 182.2 543.8 200.7 523.4 215.7z\"/></svg>",
    "up-right-inbox": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--!Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d=\"M354.4 83.8C359.4 71.8 371.1 64 384 64L544 64C561.7 64 576 78.3 576 96L576 256C576 268.9 568.2 280.6 556.2 285.6C544.2 290.6 530.5 287.8 521.3 278.7L464 221.3L310.6 374.6C298.1 387.1 277.8 387.1 265.3 374.6C252.8 362.1 252.8 341.8 265.3 329.3L418.7 176L361.4 118.6C352.2 109.4 349.5 95.7 354.5 83.7zM64 240C64 195.8 99.8 160 144 160L224 160C241.7 160 256 174.3 256 192C256 209.7 241.7 224 224 224L144 224C135.2 224 128 231.2 128 240L128 496C128 504.8 135.2 512 144 512L400 512C408.8 512 416 504.8 416 496L416 416C416 398.3 430.3 384 448 384C465.7 384 480 398.3 480 416L480 496C480 540.2 444.2 576 400 576L144 576C99.8 576 64 540.2 64 496L64 240z\"/></svg>"
};

function renderIcon(iconStr, defaultClass = '') {
    if (!iconStr) return '';

    // 1. キーの抽出 (例: "/icons/azuracast.svg" -> "azuracast", "fa-solid fa-sliders" -> "sliders")
    let key = iconStr.toLowerCase();
    if (key.includes('.svg')) {
        key = key.split('/').pop().replace('.svg', '');
    } else if (key.includes('fa-')) {
        const matches = key.match(/fa-([a-z0-9-]+)/g);
        if (matches) {
            key = matches[matches.length - 1].replace('fa-', '');
        }
    }

    // 2. SVG辞書に存在すればインラインSVGを返す
    const rawSvg = SVG_DICTIONARY[key];
    if (rawSvg) {
        return rawSvg.replace('<svg', '<svg class="w-3.5 h-3.5 fill-current inline-block flex-shrink-0"');
    }

    // 3. 画像パス（/ や . を含む）の場合
    if (iconStr.includes('/') || iconStr.includes('.')) {
        return `<img src="${iconStr}" alt="icon" loading="lazy" class="w-3.5 h-3.5 object-contain flex-shrink-0">`;
    }

    // 4. 辞書にないFont Awesome文字列などが残っていた場合はテキストを漏らさない
    return '';
}

// ローディング画面を消す処理
function hideLoadingScreen() {
    const loader = document.getElementById('loading-screen');
    if (!loader) return;
    
    loader.classList.add('opacity-0', 'pointer-events-none');
    setTimeout(() => {
        loader.classList.add('hidden');
    }, 500);
}

// プロフィール概要描画処理
function renderProfileSummary() {
    if (!configProfile) return;

    if (configProfile.name) document.getElementById('profile-name').innerText = configProfile.name;
    if (configProfile.handle) document.getElementById('profile-handle').innerText = `@${configProfile.handle}`;
    if (configProfile.title) document.getElementById('profile-title').innerText = configProfile.title;
    if (configProfile.bio) document.getElementById('profile-bio').innerText = configProfile.bio;
    if (configProfile.avatar) document.getElementById('profile-avatar').src = configProfile.avatar;

    const skillsContainer = document.getElementById('profile-skills-preview');
    if (skillsContainer && configProfile.skills) {
        const allItems = configProfile.skills.flatMap(s => s.items).slice(0, 6);
        skillsContainer.innerHTML = allItems.map(item => `
            <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60 text-[10px] font-mono">#${item}</span>
        `).join('');
    }
}

// パートナー概要描画処理
function renderPartnersSummary() {
    const grid = document.getElementById('partners-summary-grid');
    if (!grid || !configPartners || !configPartners.partners) return;

    const displayItems = configPartners.partners.slice(0, 3);

    grid.innerHTML = displayItems.map(p => `
        <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-md flex items-start gap-4 shadow-lg">
            <img src="${p.avatar || './heroImage/profile.jpg'}" alt="${p.name}" loading="lazy" class="w-14 h-14 rounded-xl object-cover border border-[#fca73f]/50 flex-shrink-0">
            <div class="space-y-1.5 min-w-0 flex-grow">
                <div class="flex items-center justify-between gap-2">
                    <h3 class="text-base font-bold text-white font-mono truncate">${p.name}</h3>
                    <span class="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#fca73f]/20 text-[#fca73f] border border-[#fca73f]/30">${p.role}</span>
                </div>
                <p class="text-slate-400 text-xs line-clamp-2 leading-relaxed">${p.bio}</p>
            </div>
        </div>
    `).join('');
}

// DOM構築後の初期化処理
window.addEventListener('DOMContentLoaded', () => {
    function safeParseJSON(elementId, label) {
        const el = document.getElementById(elementId);
        if (!el) return null;
        
        const text = el.textContent.trim();
        if (text.startsWith('<') || text.includes('<!DOCTYPE')) {
            console.error(`[SSI Error] ${label} (${elementId}) の中身がJSONではなくHTMLになっています:`, text.substring(0, 100));
            return null;
        }

        try {
            return JSON.parse(text);
        } catch (e) {
            console.error(`[JSON Parse Error] ${label} のパースに失敗しました:`, e);
            return null;
        }
    }

    configMain         = safeParseJSON('data-main', 'config.json');
    configHeader       = safeParseJSON('data-header', 'config_header.json');
    configFooter       = safeParseJSON('data-footer', 'config_footer.json');
    configServerInfo   = safeParseJSON('data-server-info', 'serverInfo/info.json');
    configSidemenuList = safeParseJSON('data-sidemenu-list', 'sidemenu-list.json');
    configProfile      = safeParseJSON('data-profile', 'config_profile.json');
    configPartners     = safeParseJSON('data-partners', 'config_partners.json');

    if (configHeader) renderHeader();
    if (configFooter) renderFooter();
    if (configMain) renderMainContent();
    if (configServerInfo) renderServerInfo();
    if (configSidemenuList) renderSidemenuList();
    if (configProfile) renderProfileSummary();
    if (configPartners) renderPartnersSummary();

    hideLoadingScreen();
});

// ヘッダーナビゲーションの描画（重複 favicon DOM 追加を防止）
function renderHeader() {
    if (!configHeader) return;

    document.getElementById('header-title').innerText = configHeader.title;
    document.getElementById('header-status').innerText = configHeader.statusText;
    document.getElementById('header-operator').innerText = configHeader.operator;
    document.getElementById('header-shortcut').innerText = configHeader.searchShortcut || '⌘K';

    const navContainer = document.getElementById('header-nav');
    navContainer.innerHTML = configHeader.navLinks.map(link => {
        if (link.href === '#telemetry') {
            return `<a href="#telemetry" onclick="toggleSideMenu(); return false;" class="px-3 py-1.5 rounded-md hover:text-white hover:bg-white/10 transition">${link.label}</a>`;
        }
        return `<a href="${link.href}" class="px-3 py-1.5 rounded-md hover:text-white hover:bg-white/10 transition">${link.label}</a>`;
    }).join('');
}

// ドロワーの開閉関数（ハンバーガーアニメーション & SSE連携）
function toggleSideMenu() {
    const menu = document.getElementById('side-menu');
    const overlay = document.getElementById('side-menu-overlay');
    const menuBtn = document.getElementById('menu-btn');

    if (!menu || !overlay) return;

    menu.classList.toggle('translate-x-full');
    overlay.classList.toggle('hidden');

    if (menuBtn) {
        menuBtn.classList.toggle('active');
    }

    const isOpen = !menu.classList.contains('translate-x-full');
    if (isOpen) {
        startTelemetry();
    } else {
        stopTelemetry();
    }
}

// sidemenu-list.json からカスタムメニュー描画
function renderSidemenuList() {
    if (!configSidemenuList) return;

    const container = document.getElementById('side-menu-custom-items');
    if (!container) return;

    let html = '';
    if (configSidemenuList.sectionTitle) {
        html += `<h3 class="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase border-t border-slate-200 pt-4 pb-1">${configSidemenuList.sectionTitle}</h3>`;
    }

    if (Array.isArray(configSidemenuList.items)) {
        html += configSidemenuList.items.map(item => {
            const isExternal = item.target === '_blank';
            // 外部リンクの場合は rotate-45 で斜め上矢印(↗)に回転させる
            const rotateClass = isExternal ? '-rotate-45' : '';
            const targetAttr = isExternal ? 'target="_blank" rel="noopener noreferrer"' : '';

            return `
                <a href="${item.url || '#'}" ${targetAttr} onclick="toggleSideMenu()" class="block p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition group">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-lg bg-[#fca73f]/10 text-[#fca73f] flex items-center justify-center text-xs group-hover:scale-105 transition-transform">
                                ${renderIcon(item.icon)}
                            </div>
                            <div>
                                <span class="text-xs font-bold text-slate-800 block font-mono">${item.label}</span>
                                ${item.description ? `<span class="text-[10px] text-slate-500 block">${item.description}</span>` : ''}
                            </div>
                        </div>
                        <span class="text-xs text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform ${rotateClass}">
                            ${renderIcon('up-light-inbox.svg')}
                        </span>
                    </div>
                </a>
            `;
        }).join('');
    }

    container.innerHTML = html;
}

// フッターの描画
function renderFooter() {
    if (!configFooter) return;
    document.getElementById('footer-copyright').innerText = configFooter.copyright;
    document.getElementById('footer-tech').innerText = configFooter.techStack || '';
    document.getElementById('footer-node-tag').innerText = configFooter.statusNode || 'Node: Active';

    const linksContainer = document.getElementById('footer-links');
    linksContainer.innerHTML = configFooter.socialLinks.map(link => 
        `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="hover:text-slate-900 transition flex items-center gap-1.5">
            ${renderIcon(link.icon)}
            <span>${link.label}</span>
        </a>`
    ).join('');
}

// メインコンテンツ描画
function renderMainContent() {
    if (!configMain) return;
    setupHeroSlides(configMain.site.heroImages);
    setupTypingEffect(configMain.site.typingTexts);
    renderCategories(configMain.categories);
    renderProjects();
}

function setupHeroSlides(images) {
    const container = document.getElementById('hero-slides-container');
    if (!container) return;
    container.innerHTML = '';
    images.forEach((imgUrl, index) => {
        const div = document.createElement('div');
        div.className = `hero-slide absolute inset-0 bg-cover bg-center ${index === 0 ? 'opacity-100' : 'opacity-0'}`;
        div.style.backgroundImage = `url('${imgUrl}')`;
        container.appendChild(div);
    });

    let currentIndex = 0;
    const slides = container.querySelectorAll('.hero-slide');
    if (slides.length <= 1) return;
    setInterval(() => {
        slides[currentIndex].classList.replace('opacity-100', 'opacity-0');
        currentIndex = (currentIndex + 1) % slides.length;
        slides[currentIndex].classList.replace('opacity-0', 'opacity-100');
    }, 5000);
}

function setupTypingEffect(texts) {
    let textIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    const target = document.getElementById('typing-text');
    if (!target) return;

    function type() {
        const currentText = texts[textIdx];
        if (isDeleting) {
            target.innerText = currentText.substring(0, charIdx - 1);
            charIdx--;
        } else {
            target.innerText = currentText.substring(0, charIdx + 1);
            charIdx++;
        }

        let speed = isDeleting ? 50 : 100;
        if (!isDeleting && charIdx === currentText.length) {
            speed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIdx === 0) {
            isDeleting = false;
            textIdx = (textIdx + 1) % texts.length;
            speed = 500;
        }
        setTimeout(type, speed);
    }
    type();
}

function renderCategories(categories) {
    const container = document.getElementById('category-filters');
    if (!container) return;
    container.innerHTML = '';
    categories.forEach(cat => {
        const btn = document.createElement('button');
        // whitespace-nowrap と flex / items-center でアイコンと文字の高さを完璧に揃える
        btn.className = `px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium transition flex items-center gap-2 whitespace-nowrap ${cat.id === activeCategory ? 'bg-slate-900 text-[#fca73f] shadow-md font-bold' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'}`;
        btn.innerHTML = `${renderIcon(cat.icon)}<span>${cat.label}</span>`;
        btn.onclick = () => {
            activeCategory = cat.id;
            renderCategories(categories);
            renderProjects();
        };
        container.appendChild(btn);
    });
}

function renderProjects() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const filtered = activeCategory === 'all' 
        ? configMain.projects 
        : configMain.projects.filter(p => p.category === activeCategory);

    filtered.forEach(p => {
        const card = document.createElement('div');
        card.className = "glass-card rounded-2xl overflow-hidden cursor-pointer transition group";
        card.onclick = () => openInspector(p.id);

        card.innerHTML = `
            <div class="h-44 bg-slate-200 relative overflow-hidden">
                <img src="${p.image}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="${p.title}">
                <div class="absolute top-3 right-3 px-2 py-0.5 rounded bg-slate-950/70 backdrop-blur-md text-white text-[10px] font-mono border border-white/20">
                    ${p.status}
                </div>
            </div>
            <div class="p-5 space-y-3">
                <div class="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>${p.category.toUpperCase()}</span>
                    <span>${p.date}</span>
                </div>
                <h3 class="text-base font-bold text-slate-900 group-hover:text-[#fca73f] transition">${p.title}</h3>
                <p class="text-slate-500 text-xs line-clamp-2">${p.description}</p>
                <div class="flex flex-wrap gap-1.5 pt-2">
                    ${p.tags.map(t => `<span class="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono border border-slate-200">${t}</span>`).join('')}
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// DevTools風スライドパネル表示（FontAwesomeクラス削除済み）
async function openInspector(id) {
    const p = configMain.projects.find(item => item.id === id);
    if (!p) return;

    let latestArticleHtml = '';

    if (p.page) {
        try {
            const categoryDir = p.category === 'motor' ? 'motorcycle' : p.category;
            const res = await fetch(`/articles/${categoryDir}/list.json`);

            if (res.ok) {
                const articles = await res.json();
                if (articles && articles.length > 0) {
                    const latest = articles[0];
                    latestArticleHtml = `
                        <div class="bg-slate-900 border border-[#fca73f]/40 rounded-xl p-4 font-mono text-xs space-y-2 shadow-inner">
                            <div class="flex items-center justify-between border-b border-slate-800 pb-1.5">
                                <span class="text-[#fca73f] font-bold flex items-center gap-1.5">
                                    <span>// LATEST LOG ENTRY</span>
                                </span>
                                <span class="text-[10px] text-slate-400">${latest.date}</span>
                            </div>
                            <a href="${p.page}?json=${latest.id}" class="block group pt-1">
                                <h4 class="text-slate-100 font-bold group-hover:text-[#fca73f] transition flex items-center justify-between gap-2">
                                    <span class="truncate">${latest.title}</span>
                                    <span class="text-[10px] text-slate-400 group-hover:translate-x-1 group-hover:text-[#fca73f] transition-transform flex-shrink-0">→</span>
                                </h4>
                                ${latest.summary ? `<p class="text-slate-400 text-[11px] mt-1 line-clamp-2 font-sans">${latest.summary}</p>` : ''}
                            </a>
                        </div>
                    `;
                }
            }
        } catch (e) {
            console.warn('[Inspector Fetch Error]', e);
        }
    }

    const content = document.getElementById('modal-content');
    content.innerHTML = `
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <span class="text-xs font-mono text-[#fca73f] font-bold">${p.category.toUpperCase()} // ${p.date}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">${p.status}</span>
            </div>
            <h2 class="text-2xl font-bold text-slate-900">${p.title}</h2>
            ${p.subtitle ? `<p class="text-xs font-mono text-slate-500 -mt-2">${p.subtitle}</p>` : ''}
            <p class="text-slate-600 text-sm leading-relaxed">${p.description}</p>

            ${latestArticleHtml}

            ${(p.specs && Object.keys(p.specs).length > 0) ? `
                <div class="bg-slate-900 text-slate-200 rounded-xl p-4 font-mono text-xs space-y-2">
                    <span class="text-slate-400 block border-b border-slate-800 pb-1">// SPECIFICATIONS</span>
                    ${Object.entries(p.specs).map(([k, v]) => `<div><span class="text-[#fca73f]">${k}:</span> ${v}</div>`).join('')}
                </div>
            ` : ''}

            ${p.schematic ? `<pre class="bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto">${p.schematic}</pre>` : ''}

            ${p.page ? `
                <div class="pt-2 border-t border-slate-100">
                    <a href="${p.page}" class="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#fca73f] hover:bg-[#e09230] text-slate-950 font-mono text-xs font-bold transition shadow-lg shadow-[#fca73f]/20 group">
                        <span>OPEN DEDICATED PAGE</span>
                        <span class="text-[10px] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>
                    </a>
                </div>
            ` : ''}
        </div>
    `;

    const overlay = document.getElementById('inspector-overlay');
    const panel = document.getElementById('inspector-modal');

    if (overlay && panel) {
        overlay.classList.remove('hidden');
        setTimeout(() => {
            panel.classList.remove('translate-x-full');
        }, 10);
    } else if (panel) {
        panel.classList.remove('hidden');
    }
}

function closeInspector() {
    const overlay = document.getElementById('inspector-overlay');
    const panel = document.getElementById('inspector-modal');

    if (panel) {
        panel.classList.add('translate-x-full');
    }
    if (overlay) {
        setTimeout(() => {
            overlay.classList.add('hidden');
        }, 300);
    } else if (panel) {
        panel.classList.add('hidden');
    }
}

function toggleCommandPalette() {
    const modal = document.getElementById('command-palette');
    if (!modal) return;
    modal.classList.toggle('hidden');
    if (!modal.classList.contains('hidden')) {
        document.getElementById('command-input').focus();
        filterCommandProjects('');
    }
}

function filterCommandProjects(q) {
    const results = document.getElementById('command-results');
    if (!results || !configMain) return;
    results.innerHTML = '';

    const filtered = configMain.projects.filter(p => 
        p.title.toLowerCase().includes(q.toLowerCase()) || 
        p.tags.some(t => t.toLowerCase().includes(q.toLowerCase()))
    );

    filtered.forEach(p => {
        const item = document.createElement('div');
        item.className = "p-2 hover:bg-slate-100 rounded cursor-pointer flex items-center justify-between";
        item.onclick = () => {
            toggleCommandPalette();
            openInspector(p.id);
        };
        item.innerHTML = `<span>${p.title}</span><span class="text-slate-400 text-[10px]">${p.category}</span>`;
        results.appendChild(item);
    });
}

function safeSetText(elementId, text) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.innerText = text;
    el.title = text;
}

function toggleMetricDetail(id) {
    const detailEl = document.getElementById(id);
    const iconEl = document.getElementById(id + '-icon');
    if (!detailEl) return;

    detailEl.classList.toggle('hidden');
    if (iconEl) {
        iconEl.classList.toggle('rotate-180');
    }
}

function renderServerInfo() {
    if (!configServerInfo) return;

    if (configServerInfo.os?.version) {
        safeSetText('info-os-version', configServerInfo.os.version);
    }
    if (configServerInfo.kernel) {
        safeSetText('info-kernel-spec', `${configServerInfo.kernel.release || '--'} (${configServerInfo.kernel.architecture || '--'})`);
    }
    if (configServerInfo.host) {
        safeSetText('info-host-family', `${configServerInfo.host.vendor || ''} ${configServerInfo.host.name || '--'}`.trim());
    }

    if (configServerInfo.cpu?.cpu) {
        safeSetText('info-cpu-model', configServerInfo.cpu.cpu);
        const cores = configServerInfo.cpu.cores;
        if (cores) {
            safeSetText('detail-cpu-cores', `${cores.physical || '--'} Physical / ${cores.logical || '--'} Logical`);
        }
        if (configServerInfo.cpu.frequency?.base) {
            safeSetText('detail-cpu-freq', `${configServerInfo.cpu.frequency.base} MHz`);
        }
        if (configServerInfo.cpu.march) {
            safeSetText('detail-cpu-arch', configServerInfo.cpu.march);
        }
    }

    if (configServerInfo.os) {
        const osName = configServerInfo.os.prettyName || configServerInfo.os.name || '--';
        safeSetText('info-os-spec', osName);
    }
    if (configServerInfo.memory?.total) {
        safeSetText('detail-mem-total', formatBytes(configServerInfo.memory.total));
    }
    if (Array.isArray(configServerInfo.swap) && configServerInfo.swap[0]) {
        const sw = configServerInfo.swap[0];
        safeSetText('detail-swap-spec', `${formatBytes(sw.used)} / ${formatBytes(sw.total)}`);
    }

    if (Array.isArray(configServerInfo.localip) && configServerInfo.localip[0]) {
        const net = configServerInfo.localip[0];
        safeSetText('info-host-spec', net.name || '--');
        safeSetText('detail-net-iface', net.name || '--');
        safeSetText('detail-net-ip', net.ipv4 || '--');
    }

    if (Array.isArray(configServerInfo.disk) && configServerInfo.disk[0]) {
        const d = configServerInfo.disk[0];
        safeSetText('info-gpu-spec', d.mountpoint || '/');
        safeSetText('detail-disk-mount', d.mountpoint || '/');
        safeSetText('detail-disk-fs', d.filesystem || '--');
    }
}

function formatBytes(bytes, decimals = 1) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function formatSpeed(bytesPerSec) {
    if (!bytesPerSec || bytesPerSec === 0) return '0 B/s';
    return formatBytes(bytesPerSec) + '/s';
}

// SSEテレメトリ接続の開始（重複防止）
function startTelemetry() {
    stopTelemetry();

    telemetrySource = new EventSource('/api/stream/sys-telemetry');

    telemetrySource.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);

            if (data.cpu?.cpu?.usage !== undefined) {
                const cpuUsage = data.cpu.cpu.usage.toFixed(1);
                safeSetText('metric-cpu', `${cpuUsage}%`);
            }

            if (data.memory?.memory) {
                const mem = data.memory.memory;
                const used = formatBytes(mem.used);
                const pct = ((mem.used / mem.total) * 100).toFixed(0);
                safeSetText('metric-ram', `${used} (${pct}%)`);
            }

            if (data.network?.network) {
                const net = data.network.network;
                const rx = formatSpeed(net.rx_sec);
                const tx = formatSpeed(net.tx_sec);
                safeSetText('metric-net', `↓${rx} ↑${tx}`);
            }

            if (data.disk?.drive) {
                const disk = data.disk.drive;
                const used = formatBytes(disk.used);
                const total = formatBytes(disk.size);
                safeSetText('metric-disk', `${used} / ${total}`);
            }

        } catch (e) {
            console.warn('[SSE Error]', e);
        }
    };

    telemetrySource.onerror = (e) => {
        console.warn('[SSE Connection Error]', e);
    };
}

// SSEテレメトリ接続の停止
function stopTelemetry() {
    if (telemetrySource) {
        telemetrySource.close();
        telemetrySource = null;
    }
}

const RADIO_API_URL = 'https://radio.enoki.xyz/api/nowplaying/neruru-radio';
let isRadioPlaying = false;

// ラジオ再生 / 停止切り替え（純粋CSS形状変更対応）
function toggleRadioPlay() {
    const audio = document.getElementById('radio-audio');
    const playIcon = document.getElementById('radio-play-icon');

    if (!audio) return;

    if (isRadioPlaying) {
        audio.pause();
        if (playIcon) {
            // 再生アイコン形状（三角形）
            playIcon.className = 'inline-block w-2.5 h-2.5 bg-[#fca73f] [clip-path:polygon(0_0,100%_50%,0_100%)] group-hover:scale-110 transition-transform ml-0.5';
        }
        isRadioPlaying = false;
        stopRadioPolling();
    } else {
        audio.load();
        audio.play().then(() => {
            if (playIcon) {
                // 一時停止アイコン形状（2本線）
                playIcon.className = 'inline-block w-2.5 h-2.5 bg-[#fca73f] [clip-path:polygon(0_0,35%_0,35%_100%,0_100%,65%_0,65%_100%,100%_100%,100%_0)] group-hover:scale-110 transition-transform';
            }
            isRadioPlaying = true;
            startRadioPolling();
        }).catch(err => {
            console.error('[Radio Playback Error]', err);
        });
    }
}

// 音量コントロール
function changeRadioVolume(val) {
    const audio = document.getElementById('radio-audio');
    if (audio) {
        audio.volume = parseFloat(val);
    }
}

// ラジオメタデータ取得
async function updateNowPlaying() {
    try {
        const res = await fetch(RADIO_API_URL);
        if (!res.ok) return;

        const data = await res.json();

        const audio = document.getElementById('radio-audio');
        if (audio && data.station && data.station.listen_url) {
            if (audio.src !== data.station.listen_url) {
                audio.src = data.station.listen_url;
            }
        }

        if (data.now_playing && data.now_playing.song) {
            const song = data.now_playing.song;
            
            document.getElementById('radio-title').innerText = song.title || 'Unknown Title';
            document.getElementById('radio-artist').innerText = song.artist || 'ねるるラジオ';

            if (song.art) {
                document.getElementById('radio-art').src = song.art;
            }
        }

        const liveDot = document.getElementById('radio-live-dot');
        const liveText = document.getElementById('radio-live-text');
        
        if (liveText && liveDot) {
            if (data.live && data.live.is_live) {
                liveText.innerText = `LIVE // ${data.live.streamer_name || 'Streamer'}`;
                liveDot.className = 'w-1.5 h-1.5 rounded-full bg-red-500 animate-ping';
            } else {
                liveText.innerText = 'AUTO DJ // ON AIR';
                liveDot.className = 'w-1.5 h-1.5 rounded-full bg-emerald-400';
            }
        }

    } catch (e) {
        console.warn('[Radio API Fetch Error]', e);
    }
}

// ポーリングの動的制御（再生中のみ10秒置きにAPI取得）
function startRadioPolling() {
    updateNowPlaying();
    if (!radioIntervalId) {
        radioIntervalId = setInterval(updateNowPlaying, 10000);
    }
}

function stopRadioPolling() {
    if (radioIntervalId) {
        clearInterval(radioIntervalId);
        radioIntervalId = null;
    }
}

// 初回メタデータ取得のみ（自動ポーリングはオフ）
document.addEventListener('DOMContentLoaded', () => {
    updateNowPlaying();
});

// ショートカットキー & ESC閉じる処理
window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
    }
    if (e.key === 'Escape') {
        closeInspector();
        const cmdPalette = document.getElementById('command-palette');
        if (cmdPalette) cmdPalette.classList.add('hidden');
        
        const menu = document.getElementById('side-menu');
        if (menu && !menu.classList.contains('translate-x-full')) {
            toggleSideMenu();
        }
    }
});