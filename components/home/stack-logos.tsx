import {
  SiNextdotjs,
  SiReact,
  SiTypescript,
  SiTailwindcss,
  SiFlutter,
  SiSwift,
  SiKotlin,
  SiNodedotjs,
  SiPython,
  SiPhp,
  SiLaravel,
  SiRuby,
  SiPostgresql,
  SiMysql,
  SiAmazonwebservices,
  SiCloudflare,
  SiVercel,
  SiSupabase,
  SiFirebase,
  SiOpenai,
  SiClaude,
  SiShopify,
  SiWordpress,
  SiBluetooth,
  SiThreedotjs,
} from "react-icons/si"
import { FaJava } from "react-icons/fa"

/** n8n is absent from react-icons — inline its mark, sized like the other icons. */
function N8nIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="currentColor"
      fillRule="evenodd"
      style={{ flex: "none", lineHeight: 1 }}
      aria-hidden="true"
    >
      <path
        clipRule="evenodd"
        d="M24 8.4c0 1.325-1.102 2.4-2.462 2.4-1.146 0-2.11-.765-2.384-1.8h-3.436c-.602 0-1.115.424-1.214 1.003l-.101.592a2.38 2.38 0 01-.8 1.405c.412.354.704.844.8 1.405l.1.592A1.222 1.222 0 0015.719 15h.975c.273-1.035 1.237-1.8 2.384-1.8 1.36 0 2.461 1.075 2.461 2.4S20.436 18 19.078 18c-1.147 0-2.11-.765-2.384-1.8h-.975c-1.204 0-2.23-.848-2.428-2.005l-.101-.592a1.222 1.222 0 00-1.214-1.003H10.97c-.308.984-1.246 1.7-2.356 1.7-1.11 0-2.048-.716-2.355-1.7H4.817c-.308.984-1.246 1.7-2.355 1.7C1.102 14.3 0 13.225 0 11.9s1.102-2.4 2.462-2.4c1.183 0 2.172.815 2.408 1.9h1.337c.236-1.085 1.225-1.9 2.408-1.9 1.184 0 2.172.815 2.408 1.9h.952c.601 0 1.115-.424 1.213-1.003l.102-.592c.198-1.157 1.225-2.005 2.428-2.005h3.436c.274-1.035 1.238-1.8 2.384-1.8C22.898 6 24 7.075 24 8.4zm-1.23 0c0 .663-.552 1.2-1.232 1.2-.68 0-1.23-.537-1.23-1.2 0-.663.55-1.2 1.23-1.2.68 0 1.231.537 1.231 1.2zM2.461 13.1c.68 0 1.23-.537 1.23-1.2 0-.663-.55-1.2-1.23-1.2-.68 0-1.231.537-1.231 1.2 0 .663.55 1.2 1.23 1.2zm6.153 0c.68 0 1.231-.537 1.231-1.2 0-.663-.55-1.2-1.23-1.2-.68 0-1.231.537-1.231 1.2 0 .663.55 1.2 1.23 1.2zm10.462 3.7c.68 0 1.23-.537 1.23-1.2 0-.663-.55-1.2-1.23-1.2-.68 0-1.23.537-1.23 1.2 0 .663.55 1.2 1.23 1.2z"
      />
    </svg>
  )
}

/**
 * Curated on two axes: high-demand technologies, plus scarce-supply skills
 * (Java legacy work, Three.js, BLE) that few small studios can take on.
 * The full capability range is described in the about page's coverage/services.
 */
export const STACK_LOGOS = [
  { node: <SiNextdotjs />, title: "Next.js" },
  { node: <SiReact />, title: "React" },
  { node: <SiTypescript />, title: "TypeScript" },
  { node: <SiTailwindcss />, title: "Tailwind CSS" },
  { node: <SiThreedotjs />, title: "Three.js" },
  { node: <SiFlutter />, title: "Flutter" },
  { node: <SiSwift />, title: "Swift" },
  { node: <SiKotlin />, title: "Kotlin" },
  { node: <SiNodedotjs />, title: "Node.js" },
  { node: <SiPython />, title: "Python" },
  { node: <SiPhp />, title: "PHP" },
  { node: <SiLaravel />, title: "Laravel" },
  { node: <SiRuby />, title: "Ruby on Rails" },
  { node: <FaJava />, title: "Java" },
  { node: <SiPostgresql />, title: "PostgreSQL" },
  { node: <SiMysql />, title: "MySQL" },
  { node: <SiAmazonwebservices />, title: "AWS" },
  { node: <SiCloudflare />, title: "Cloudflare" },
  { node: <SiVercel />, title: "Vercel" },
  { node: <SiSupabase />, title: "Supabase" },
  { node: <SiFirebase />, title: "Firebase" },
  { node: <SiOpenai />, title: "OpenAI" },
  { node: <SiClaude />, title: "Claude" },
  { node: <N8nIcon />, title: "n8n" },
  { node: <SiShopify />, title: "Shopify" },
  { node: <SiWordpress />, title: "WordPress" },
  { node: <SiBluetooth />, title: "BLE" },
]
