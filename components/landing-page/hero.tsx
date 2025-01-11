import Image from 'next/image'

export default function HeroSection() {
    return (
      <div className="relative sm:min-h-screen bg-white flex flex-col items-start justify-start sm:justify-center mt-[100px] ">
        <div className="relative w-full h-full">
          <Image 
            src="/logofideliza.svg"
            alt="Fideliza Logo"
            width={1050}
            height={1021}
            className="absolute object-contain hidden sm:block"
            style={{ top: '-220px', left: '400px', opacity: 0.2, zIndex: 1 }}
          />
        </div>

        <div className="relative z-10 w-full px-4 sm:px-0">
          <div className="max-w-2xl">
            <h1 className="font-extrabold text-[40px] sm:text-[72px] leading-[48px] sm:leading-[86.4px] tracking-tight mb-6">
              <span className="text-[36px] sm:text-[72px] font-[800] leading-[48px] sm:leading-[86.4px] break-words sm:whitespace-nowrap">Your Local Favorites,</span>{" "}
              <span className="block text-[36px] sm:text-[72px] font-[800] leading-[48px] sm:leading-[86.4px]">
                Just{" "}
                <span className="text-[#3346d7] text-[36px] sm:text-[72px] font-[800] leading-[48px] sm:leading-[86.4px]">
                  Scan Away
                </span>
              </span>
            </h1>
            
            <p className="text-semi-bold-1 text-third-gray mb-6">
              Easily connect with local businesses, customize your{' '}
              <br className="hidden sm:block" />
              subscriptions, and save big!
            </p>
            
            <button className="inline-flex items-center px-8 py-4 rounded-[1000px] bg-gradient-to-r from-[#3626BA] to-[#6F29D8] text-white font-medium hover:opacity-90 transition-opacity mt-[20px]">
              Learn More
              <svg 
                className="ml-2 w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5l7 7-7 7" 
                />
              </svg>
            </button>

            <div className="relative">
              <Image 
                src="/logofideliza.svg"
                alt="Fideliza Logo"
                width={504.57}
                height={431}
                className="absolute object-contain hidden sm:block"
                style={{ top: '-500px', left: '800px' }}
              />
            </div>
          </div>
          
          {/* Role selection card */}
          <div className="mt-16 bg-black rounded-3xl mx-[-16px] sm:mx-0 p-4 sm:p-8 pt-8 sm:pt-12 text-center min-h-[250px] sm:min-h-[412px]">
            <div className="px-4">
              <h2 className="!text-[#F4F4F4] !text-[28px] sm:!text-[72px] !font-[800] !leading-[40px] sm:!leading-[86.4px] text-center mb-8 !font-['Open_Sans']">
                Choose Your Role and Join{' '}
                <br className="hidden sm:block" />
                Right Now!
              </h2>
              
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-20 justify-center mt-8 sm:mt-16 hidden sm:flex">
                <button className="w-full sm:w-auto px-6 py-3 bg-[#816DF7] hover:opacity-90 transition-colors rounded-full">
                  <span className="text-[#FFFFFF] text-[18px] sm:text-[24px] font-[700] leading-[24px] sm:leading-[32px] font-['Open_Sans']">
                    Get Started, As Business Owner
                  </span>
                </button>
                <button className="w-full sm:w-auto px-6 py-3 bg-[#816DF7] hover:opacity-90 transition-colors rounded-full">
                  <span className="text-[#FFFFFF] text-[18px] sm:text-[24px] font-[700] leading-[24px] sm:leading-[32px] font-['Open_Sans']">
                    Get Started, As Customer
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  