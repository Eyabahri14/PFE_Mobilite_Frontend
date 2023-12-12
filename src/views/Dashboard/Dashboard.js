// Dashboard.js

import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "components/Card/Card.js";
import styles from "../Dashboard/DashboardStyle.css"; 

const useStyles = makeStyles(styles);

export default function Dashboard() {
  const classes = useStyles();
  return (
    <div>
      <div className="pimg1">
        <div className="ptext">
          <span className="border">
            Dijon Métropole
          </span>
        </div>
      </div>

      <section className="section section-light">
        <h2>Visualisation des flux de mobilité par un jumeau numérique</h2>
        <p>
        Découvrez comment Dijon Métropole devient plus intelligente grâce au projet OnDijon. Notre objectif est de rendre la vie des habitants du Grand Dijon meilleure en repensant la mobilité. 
        Grâce à notre interface, nous visualisons comment les gens se déplacent, ce qui aide les responsables à améliorer la ville.
        </p>
      </section>

      <div className="pimg2">
        <div className="ptext">
          <span className="border-trans">
          </span>
        </div>
      </div>

      <section id="partners" class="section section-dark">
  <h2 class="section-title">Nos Partenaires Clés</h2>
  <div class="partners-content">
    <p class="partners-description">
      OnDijon est honoré de collaborer avec des partenaires clés qui soutiennent notre mission d'améliorer la mobilité dans le Grand Dijon. Parmi nos précieux partenaires, nous comptons :
    </p>
    <ul class="partner-list">
      <li class="partner-item">
        <strong><a href="https://www.kereval.com/" class="partner-link">Kereval</a></strong> : Une entreprise spécialisée en ingénierie du test, interopérabilité et cybersécurité. Kereval est un partenaire essentiel dans notre démarche pour rendre Dijon Métropole plus intelligente et connectée.
      </li>
      <li class="partner-item">
        <strong><a href="https://www.metropole-dijon.fr/" class="partner-link">Dijon Métropole</a></strong> : L'organisme regroupant les communes de la région dijonnaise, dont le pôle mobilité est un acteur clé de notre projet.
      </li>
    </ul>
  </div>
</section>


      <div className="pimg3">
        <div className="ptext">
          <span className="border-trans">
          </span>
        </div>
      </div>
<section className="section section-dark">
  <h2 className="section-title">Contacts du Projet</h2>
  <div className="contacts-content">
    <ul className="contacts-list">
      <li className="contact-item">
        <strong className="contact-name">Lucas Morlet</strong> - Enseignant-chercheur en Informatique à ESEO, responsable de l’option Smart City<br />
        <a href="mailto:lucas.morlet@eseo.fr" className="contact-email">lucas.morlet@eseo.fr</a>
      </li>
      <li className="contact-item">
        <strong className="contact-name">Alain Ribault</strong> - CTO de Kereval<br />
        <a href="mailto:alain.ribault@kereval.com" className="contact-email">alain.ribault@kereval.com</a>
      </li>
      <li className="contact-item">
        <strong className="contact-name">David Fau</strong> - Responsable du pôle Data de Dijon Métropole<br />
        <a href="mailto:dfau@metropole-dijon.fr" className="contact-email">dfau@metropole-dijon.fr</a>
      </li>
      <li className="contact-item">
        <strong className="contact-name">Florent Gallet</strong> - Chargé de mission "mobilités actives" de Dijon Métropole<br />
        <a href="mailto:fgallet@metropole-dijon.fr" className="contact-email">fgallet@metropole-dijon.fr</a>
      </li>
    </ul>
  </div>
</section>


    </div>
  );
}
