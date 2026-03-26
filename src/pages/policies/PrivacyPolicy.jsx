import { useState } from "react";
import PolicyLayout from "../../components/PolicyLayout";
import Section from "../../components/Section";

export default function PrivacyPolicy() {
  const [active, setActive] = useState(null);

  return (
    <PolicyLayout title="Privacy Policy">

      <Section
        title="Information We Collect"
        isActive={active === 1}
        onClick={() => setActive(1)}
      >
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Laborum magni minima aspernatur. Laboriosam atque velit perspiciatis! Eius aperiam autem animi, recusandae consequuntur repellendus, enim impedit ratione ipsa magnam eveniet. Eveniet esse deserunt blanditiis animi beatae provident maxime fugiat, nobis fuga enim eum dolorem facere numquam, aperiam illo! Totam voluptate ipsum repudiandae nam pariatur debitis nobis culpa iste modi quia doloribus voluptatum ducimus distinctio omnis harum ipsam fugiat, qui, hic nisi neque consequatur autem saepe! Ea laborum officia perspiciatis nam odio!
      </Section>

      <Section
        title="How We Use Information"
        isActive={active === 2}
        onClick={() => setActive(2)}
      >
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tempora dolorem assumenda eum minus similique voluptatum quibusdam, est quam porro impedit obcaecati magni minima accusamus molestias eligendi ipsum, asperiores rem. Est assumenda tempora soluta suscipit reprehenderit aspernatur ipsa ea ratione iure, eveniet pariatur velit necessitatibus dolor laboriosam corporis quae incidunt aliquid nemo sed et laborum cupiditate molestias adipisci. Delectus, aut rem.
      </Section>

      <Section
        title="Cookies & Tracking"
        isActive={active === 3}
        onClick={() => setActive(3)}
      >
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae unde consequatur vero, quo exercitationem blanditiis, aut consectetur eveniet asperiores deserunt qui ipsum soluta error iste. A dolore, tenetur ad exercitationem inventore repudiandae recusandae voluptates autem deleniti? Exercitationem aliquid culpa voluptate!
      </Section>

      <Section
        title="Data Security"
        isActive={active === 4}
        onClick={() => setActive(4)}
      >
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Sunt hic quaerat dolor est optio! Praesentium consequuntur molestias, reprehenderit porro animi natus officiis delectus voluptates doloremque voluptas qui a harum tempora?
      </Section>

      <Section
        title="User Rights"
        isActive={active === 5}
        onClick={() => setActive(5)}
      >
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto exercitationem aut odio aspernatur quas quo dignissimos tempora harum in a?
      </Section>

    </PolicyLayout>
  );
}