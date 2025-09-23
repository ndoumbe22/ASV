// src/components/Accueil.js
import React, { useEffect, useState } from "react";

function Accueil() {
  // Cartes des services
  const serviceCards = [
    {
      title: 'Annuaire Médical',
      description: "AssitoSanté rassemble un grand nombre d'acteurs clés de la santé.",
      icon: 'bi-book-half'
    },
    {
      title: 'Orientation',
      description: 'Trouver votre praticien facilement avec un système de géolocalisation intégré.',
      icon: 'bi-geo-alt-fill'
    },
    {
      title: 'Rendez-vous',
      description: 'Demander un rendez-vous auprès de votre médecin.',
      icon: 'bi-clock-fill'
    },
    {
      title: 'Consultation',
      description: 'Consultez un professionnel de santé à distance, partout et à tout moment.',
      icon: 'bi-chat-dots-fill'
    },
    {
      title: 'Chatbot',
      description: 'Obtenez des conseils médicaux instantanés grâce à notre assistant virtuel.',
      icon: 'bi-robot'
    }
  ];

  // Données pour les compteurs
  const stats = [
    { label: "Médecins inscrits", value: 3, icon: "bi-person-badge" },
    { label: "Patients actifs", value: 0, icon: "bi-people-fill" },
    { label: "Consultations en ligne", value: 0, icon: "bi-laptop" },
    { label: "Pharmacies partenaires", value: 7, icon: "bi-capsule" },
  ];

  const [counts, setCounts] = useState(stats.map(() => 0));

  // Animation des compteurs
  useEffect(() => {
    const interval = setInterval(() => {
      setCounts((prevCounts) =>
        prevCounts.map((count, i) =>
          count < stats[i].value ? count + Math.ceil(stats[i].value / 100) : stats[i].value
        )
      );
    }, 30);
    return () => clearInterval(interval);
  }, [stats]);

  // Récupération des témoignages depuis l'API contact_footer
  const [temoignages, setTemoignages] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/contact_footer/") // URL complète vers le ViewSet
      .then((res) => res.json())
      .then((data) => setTemoignages(data))
      .catch((err) => console.error("Erreur récupération témoignages:", err));
  }, []);

  return (
    <>
      {/* Section Accueil */}
      <section
        className="position-relative overflow-hidden"
        style={{
          minHeight: "calc(100vh - 140px)",
          width: "112.5%",
          marginTop: "-50px",
          padding: "40px 0",
          marginLeft: "-70px",
        }}
      >
        {/* Vidéo de fond */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{ objectFit: "cover", zIndex: -1 }}
        >
          <source src="/videos/medical_bg.mp4" type="video/mp4" />
          Votre navigateur ne supporte pas la vidéo.
        </video>

        <div className="container-fluid h-100">
          <div className="row align-items-center h-100">
            <div className="col-lg-6 text-white px-5">
              <h1 className="fw-bold mb-4">
                AssistoSanté : votre partenaire santé virtuel
              </h1>
              <p className="lead mb-4">
                Notre mission est de promouvoir la santé et le bien-être grâce à
                une plateforme qui facilite l’accès aux soins de qualité, aux
                professionnels de santé et aux services médicaux, partout et à
                tout moment.
              </p>
              <p className="mb-4">
                Avec AssistoSanté, trouvez rapidement un médecin, une pharmacie,
                une clinique ou encore accédez à nos services de téléconsultation.
              </p>
            </div>

            <div className="col-lg-6 px-5">
              <div
                id="carouselAccueil"
                className="carousel slide shadow-lg rounded"
                data-bs-ride="carousel"
                style={{
                  borderRadius: "100px",
                  border: "8px solid aliceblue",
                  backgroundColor: "aliceblue",
                }}
              >
                <div className="carousel-inner">
                  <div className="carousel-item active">
                    <img
                      src="/images/medecin.jpg"
                      className="d-block w-100"
                      alt="Médecin généraliste"
                    />
                    <div className="carousel-caption d-block">
                      <h5 className="bg-danger text-white px-3 py-1 rounded">
                        Médecin généraliste
                      </h5>
                    </div>
                  </div>
                  <div className="carousel-item">
                    <img
                      src="/images/hopital2.jpg"
                      className="d-block w-100"
                      alt="Hôpitaux modernes"
                    />
                    <div className="carousel-caption d-block">
                      <h5 className="bg-danger text-white px-3 py-1 rounded">
                        Hôpitaux modernes
                      </h5>
                    </div>
                  </div>
                  <div className="carousel-item">
                    <img
                      src="/images/pharmacie2.jpg"
                      className="d-block w-100"
                      alt="Pharmacies de proximité"
                    />
                    <div className="carousel-caption d-block">
                      <h5 className="bg-danger text-white px-3 py-1 rounded">
                        Pharmacies de proximité
                      </h5>
                    </div>
                  </div>
                </div>

                <button
                  className="carousel-control-prev"
                  type="button"
                  data-bs-target="#carouselAccueil"
                  data-bs-slide="prev"
                >
                  <span className="carousel-control-prev-icon"></span>
                </button>
                <button
                  className="carousel-control-next"
                  type="button"
                  data-bs-target="#carouselAccueil"
                  data-bs-slide="next"
                >
                  <span className="carousel-control-next-icon"></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nos Services */}
      <section
        className="d-flex align-items-center justify-content-center"
        style={{
          backgroundColor: "#f8f9fa",
          padding: "60px 0",
          width: "115%",
          marginLeft: "-70px",
        }}
      >
        <h2 className="fw-bold text-center">Nos Services</h2>
      </section>

      <section
        className="py-5"
        style={{
          backgroundColor: "#f2f2f2",
          paddingLeft: "20px",
          width: "115%",
          marginLeft: "-70px",
        }}
      >
        <div className="container">
          <div className="row justify-content-center">
            {serviceCards.map((card, index) => (
              <div key={index} className="col-lg-2 col-md-4 col-sm-6 mb-4">
                <div
                  className="card h-100 border-0 shadow-lg text-center p-4"
                  style={{
                    borderRadius: "15px",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    backdropFilter: "blur(5px)",
                    width: "210px",
                  }}
                >
                  <div className="card-body">
                    <i
                      className={`bi ${card.icon} text-primary`}
                      style={{ fontSize: "3rem" }}
                    ></i>
                    <h5 className="card-title mt-3">{card.title}</h5>
                    <p className="card-text text-secondary">{card.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistiques */}
      <section
        className="py-5 text-white"
        style={{
          backgroundColor: "#4b97e9",
          width: "115%",
          marginLeft: "-70px",
        }}
      >
        <div className="container">
          <div className="row text-center">
            {stats.map((stat, i) => (
              <div key={i} className="col-lg-3 col-md-6 mb-4">
                <i className={`bi ${stat.icon}`} style={{ fontSize: "3rem" }}></i>
                <h2 className="fw-bold mt-2">{counts[i]}</h2>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Témoignages */}
      <section
  className="py-5 position-relative"
  style={{
    backgroundColor: "#f8f9fa",
    width: "115%",
    marginLeft: "-70px",
  }}
>
  <div className="container text-center position-relative">
    <p className="text-primary fw-bold">Témoignages</p>
    <h2 className="fw-bold mb-5">Ce que nos patients disent</h2>

    {temoignages.length === 0 ? (
      <p>Aucun témoignage disponible pour le moment.</p>
    ) : (
      <div className="position-relative d-flex justify-content-center align-items-center">
        {/* Image centrale */}
        <div
          className="rounded-circle shadow"
          style={{
            width: "200px",
            height: "200px",
            overflow: "hidden",
            zIndex: 1,
          }}
        >
          <img
            src="/images/central_image.jpg" // Remplacer par ton image
            alt="Patient central"
            className="w-100 h-100"
            style={{ objectFit: "cover" }}
          />
        </div>

        {/* Témoignages autour */}
        {temoignages.slice(0, 4).map((t, index) => {
          // Positions autour de l'image centrale
          const positions = [
            { top: "-40px", left: "300px" },
            { top: "-40px", right: "300px" },
            { bottom: "-40px", left: "300px" },
            { bottom: "-40px", right: "300px" },
          ];
          const pos = positions[index] || { top: "0", left: "0" };

          return (
            <div
              key={index}
              className="position-absolute shadow rounded bg-white p-3 text-start"
              style={{
                width: "180px",
                zIndex: 2,
                ...pos,
              }}
            >
              <p className="mb-2">"{t.message}"</p>
              <span className="fw-bold text-primary">{t.nom}</span>
              <br />
              <small className="text-muted">{t.sujet}</small>
            </div>
          );
        })}
      </div>
    )}
  </div>
</section>
    </>
  );
}

export default Accueil;
