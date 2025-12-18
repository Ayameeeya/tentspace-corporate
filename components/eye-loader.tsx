type EyeLoaderProps = {
  variant?: 'loading' | 'end'
}

export function EyeLoader({ variant = 'loading' }: EyeLoaderProps) {
  const isEnd = variant === 'end'

  return (
    <div className="eye-loader">
      <style jsx>{`
        .eye-loader {
          position: relative;
          width: 108px;
          height: 48px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .eye-loader::after,
        .eye-loader::before {
          content: "";
          display: inline-block;
          width: 48px;
          height: 48px;
          background-color: #fff;
          background-image: radial-gradient(circle 14px, #000 100%, transparent 0);
          background-repeat: no-repeat;
          background-position: 0px 0px;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1), inset 0 -2px 4px rgba(0, 0, 0, 0.05);
          animation: ${isEnd ? 'eyeMove 10s infinite, blink 10s infinite' : 'quickBlink 1.8s infinite'};
        }

        @keyframes quickBlink {
          0% {
            height: 48px;
            background-position: 0px 0px;
          }
          15% {
            height: 18px;
            background-position: 0px 0px;
          }
          17% {
            height: 48px;
            background-position: 0px 0px;
          }
          40%, 100% {
            height: 48px;
            background-position: 0px 15px;
          }
        }

        @keyframes eyeMove {
          0%, 10% {
            background-position: 0px 0px;
          }
          13%, 40% {
            background-position: -15px 0px;
          }
          43%, 70% {
            background-position: 15px 0px;
          }
          73%, 90% {
            background-position: 0px 15px;
          }
          93%, 100% {
            background-position: 0px 0px;
          }
        }

        @keyframes blink {
          0%, 10%, 12%, 20%, 22%, 40%, 42%, 60%, 62%, 70%, 72%, 90%, 92%, 98%, 100% {
            height: 48px;
          }
          11%, 21%, 41%, 61%, 71%, 91%, 99% {
            height: 18px;
          }
        }
      `}</style>
    </div>
  )
}
