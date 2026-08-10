import SwiftUI
import CoreText

// MARK: - Robust Font Registration Helper
public class FontManager {
    public static var fontsRegistered = false
    
    public static func registerCustomFonts() {
        guard !fontsRegistered else { return }
        fontsRegistered = true
        
        let fontFiles = [
            "unpack.otf",
            "ownglyph.ttf",
            "bricolage_grotesque_variable.ttf",
            "dela_gothic_one_regular.ttf",
            "google_sans_regular.ttf",
            "roboto_medium_numbers.ttf"
        ]
        
        for fontFile in fontFiles {
            let nsString = fontFile as NSString
            let name = nsString.deletingPathExtension
            let ext = nsString.pathExtension
            
            let candidateURLs: [URL?] = [
                Bundle.main.url(forResource: name, withExtension: ext),
                Bundle.main.url(forResource: fontFile, withExtension: nil),
                Bundle.main.url(forResource: name, withExtension: ext, subdirectory: "Fonts"),
                Bundle.main.url(forResource: fontFile, withExtension: nil, subdirectory: "Fonts"),
                Bundle(for: FontManager.self).url(forResource: name, withExtension: ext)
            ]
            
            for case let url? in candidateURLs {
                var errorRef: Unmanaged<CFError>?
                CTFontManagerRegisterFontsForURL(url as CFURL, .process, &errorRef)
            }
        }
    }
}

// MARK: - Custom Font Extensions
extension Font {
    static func palzeeTitle(size: CGFloat = 36) -> Font {
        FontManager.registerCustomFonts()
        
        let unpackFontNames = ["PINT", "PINT-Regular", "unpack", "Unpack", "PINT Regular"]
        for fontName in unpackFontNames {
            if UIFont(name: fontName, size: size) != nil {
                return .custom(fontName, size: size)
            }
        }
        
        if UIFont(name: "Ownglyph_smartiam-Rg", size: size) != nil {
            return .custom("Ownglyph_smartiam-Rg", size: size)
        }
        
        if UIFont(name: "DelaGothicOne-Regular", size: size) != nil {
            return .custom("DelaGothicOne-Regular", size: size)
        }
        
        return .system(size: size, weight: .heavy, design: .rounded)
    }
    
    static func taglineFont(size: CGFloat = 17) -> Font {
        FontManager.registerCustomFonts()
        if UIFont(name: "GoogleSans-Regular", size: size) != nil {
            return .custom("GoogleSans-Regular", size: size)
        } else {
            return .system(size: size, weight: .regular, design: .default)
        }
    }
    
    static func buttonFont(size: CGFloat = 17) -> Font {
        return .system(size: size, weight: .semibold, design: .default)
    }
    
    static func helpFont(size: CGFloat = 15.5) -> Font {
        return .system(size: size, weight: .regular, design: .default)
    }
}

// MARK: - Onboarding View (Exact Reference Image Replication)
public struct OnboardingView: View {
    @State private var showingPasskeyFlow = false
    @State private var showingAppleFlow = false
    @State private var showingHelpFlow = false

    public init() {
        FontManager.registerCustomFonts()
    }

    public var body: some View {
        GeometryReader { geometry in
            let screenWidth = geometry.size.width
            let safeTop = geometry.safeAreaInsets.top
            let safeBottom = geometry.safeAreaInsets.bottom
            
            ZStack {
                // Background color matching the image canvas (#F6F6F6 off-white)
                Color(red: 246/255.0, green: 246/255.0, blue: 246/255.0)
                    .ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Safe top spacing adjustment
                    Spacer().frame(height: max(safeTop - 10, 10))
                    
                    // ==========================================
                    // 1. TOP DOODLE COLLAGE AREA
                    // ==========================================
                    ZStack {
                        // Center Yellow Cloud Logo
                        Image("onboarding_logo")
                            .resizable()
                            .scaledToFit()
                            .frame(width: 175, height: 160)
                            .offset(y: 15)
                        
                        // Envelope Doodle (Left)
                        Image("dm_envalope")
                            .resizable()
                            .scaledToFit()
                            .frame(width: 68, height: 55)
                            .rotationEffect(.degrees(-8))
                            .offset(x: -screenWidth * 0.36, y: 35)
                        
                        // Crescent Moon Doodle (Right)
                        Image("dm_moon")
                            .resizable()
                            .scaledToFit()
                            .frame(width: 72, height: 68)
                            .offset(x: screenWidth * 0.36, y: 32)
                        
                        // Star 1 (Far Left 4-Point Sparkle)
                        Image("dm_star_1")
                            .resizable()
                            .scaledToFit()
                            .frame(width: 40, height: 40)
                            .offset(x: -screenWidth * 0.38, y: -80)
                        
                        // Star 2 (Top Left Yellow Star with face)
                        Image("dm_star_2")
                            .resizable()
                            .scaledToFit()
                            .frame(width: 68, height: 68)
                            .rotationEffect(.degrees(-6))
                            .offset(x: -screenWidth * 0.20, y: -105)
                        
                        // Star 3 (Center Small Sparkle)
                        Image("dm_star_3")
                            .resizable()
                            .scaledToFit()
                            .frame(width: 32, height: 32)
                            .offset(x: screenWidth * 0.05, y: -115)
                        
                        // Star 4 (Top Right Yellow Star with eyes)
                        Image("dm_star_4")
                            .resizable()
                            .scaledToFit()
                            .frame(width: 68, height: 68)
                            .rotationEffect(.degrees(6))
                            .offset(x: screenWidth * 0.26, y: -105)
                        
                        // Star 5 (Far Right Sparkle Outline)
                        Image("dm_star_5")
                            .resizable()
                            .scaledToFit()
                            .frame(width: 38, height: 38)
                            .offset(x: screenWidth * 0.40, y: -55)
                    }
                    .frame(height: 230)
                    
                    Spacer(minLength: 4)
                    
                    // ==========================================
                    // 2. TITLE & TAGLINE SECTION
                    // ==========================================
                    VStack(spacing: 8) {
                        Text("PALZEE")
                            .font(.palzeeTitle(size: 36))
                            .foregroundColor(.black)
                            .tracking(1.2)
                        
                        VStack(spacing: 3) {
                            Text("new moment every hour,")
                            Text("vlog it with your friends.")
                        }
                        .font(.taglineFont(size: 17))
                        .foregroundColor(Color(red: 0.12, green: 0.12, blue: 0.12))
                        .multilineTextAlignment(.center)
                    }
                    
                    Spacer(minLength: 6)
                    
                    // ==========================================
                    // 3. MIDDLE DOODLE COLLAGE AREA
                    // ==========================================
                    ZStack {
                        // Pizza Slice (Left side, tilted downward)
                        Image("dm_pizza")
                            .resizable()
                            .scaledToFit()
                            .frame(width: 120, height: 120)
                            .rotationEffect(.degrees(-15))
                            .offset(x: -screenWidth * 0.33, y: -5)
                        
                        // Orange Fruit (Center bottom)
                        Image("dm_orange")
                            .resizable()
                            .scaledToFit()
                            .frame(width: 48, height: 52)
                            .offset(x: -screenWidth * 0.04, y: 28)
                        
                        // Potted Plant with Leafy Vines (Right side)
                        Image("dm_plant")
                            .resizable()
                            .scaledToFit()
                            .frame(width: 180, height: 170)
                            .offset(x: screenWidth * 0.34, y: -8)
                    }
                    .frame(height: 140)
                    
                    Spacer(minLength: 14)
                    
                    // ==========================================
                    // 4. BUTTONS SECTION
                    // ==========================================
                    VStack(spacing: 12) {
                        // Button 1: Connect with Passkey
                        Button(action: {
                            showingPasskeyFlow = true
                        }) {
                            HStack(spacing: 10) {
                                Image("ic_passkey")
                                    .resizable()
                                    .renderingMode(.template)
                                    .scaledToFit()
                                    .frame(width: 22, height: 22)
                                    .foregroundColor(.white)
                                
                                Text("Connect with Passkey")
                                    .font(.buttonFont(size: 17))
                                    .foregroundColor(.white)
                            }
                            .frame(maxWidth: .infinity)
                            .frame(height: 56)
                            .background(Color.black)
                            .clipShape(Capsule())
                        }
                        
                        // Button 2: Connect with Apple
                        Button(action: {
                            showingAppleFlow = true
                        }) {
                            HStack(spacing: 10) {
                                Image(systemName: "apple.logo")
                                    .font(.system(size: 20, weight: .medium))
                                    .foregroundColor(.white)
                                    .offset(y: -1)
                                
                                Text("Connect with Apple")
                                    .font(.buttonFont(size: 17))
                                    .foregroundColor(.white)
                            }
                            .frame(maxWidth: .infinity)
                            .frame(height: 56)
                            .background(Color.black)
                            .clipShape(Capsule())
                        }
                    }
                    .padding(.horizontal, 24)
                    
                    Spacer(minLength: 16)
                    
                    // ==========================================
                    // 5. HELP LINK & BOTTOM DOODLES
                    // ==========================================
                    ZStack(alignment: .top) {
                        // Help text center top
                        Button(action: {
                            showingHelpFlow = true
                        }) {
                            Text("having trouble logging in?")
                                .font(.helpFont(size: 15.5))
                                .underline()
                                .foregroundColor(.black)
                        }
                        .offset(y: 0)
                        
                        // Bottom Doodles Row
                        ZStack(alignment: .bottom) {
                            // Bottom Left: Tea Cup Doodle
                            HStack {
                                Image("dm_tea")
                                    .resizable()
                                    .scaledToFit()
                                    .frame(width: 92, height: 110)
                                    .offset(x: 10, y: 5)
                                
                                Spacer()
                            }
                            
                            // Bottom Center: 3 Flame Doodles
                            Image("dm_fire")
                                .resizable()
                                .scaledToFit()
                                .frame(width: 62, height: 48)
                                .offset(y: 12)
                            
                            // Bottom Right: Bingsu / Ice Cream Glass Doodle
                            HStack {
                                Spacer()
                                
                                Image("dm_bingsu")
                                    .resizable()
                                    .scaledToFit()
                                    .frame(width: 92, height: 110)
                                    .offset(x: -10, y: 5)
                            }
                        }
                        .frame(height: 115)
                        .offset(y: 18)
                    }
                    .frame(height: 135)
                    
                    Spacer().frame(height: max(safeBottom, 5))
                }
            }
        }
        .alert("Passkey Login", isPresented: $showingPasskeyFlow) {
            Button("OK", role: .cancel) { }
        } message: {
            Text("Passkey authentication initiated.")
        }
        .alert("Apple Sign In", isPresented: $showingAppleFlow) {
            Button("OK", role: .cancel) { }
        } message: {
            Text("Apple Sign In initiated.")
        }
        .alert("Help", isPresented: $showingHelpFlow) {
            Button("OK", role: .cancel) { }
        } message: {
            Text("Troubleshooting & backup login options.")
        }
    }
}
