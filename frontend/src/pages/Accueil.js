import React, { useState, useEffect } from "react";
import api from "../services/api";

function Accueil() {
  const [stats, setStats] = useState([
    { title: "Médecins", value: "0", icon: "bi bi-person-fill" },
    { title: "Patients", value: "0", icon: "bi bi-people-fill" },
    { title: "Cliniques", value: "0", icon: "bi bi-hospital-fill" },
    { title: "Pharmacies", value: "0", icon: "bi bi-capsule" },
  ]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Services data (static as these are features, not dynamic counts)
  const services = [
    {
      title: "Recherche de Médecins",
      description:
        "Trouvez facilement des médecins généralistes et spécialistes près de chez vous.",
      icon: "bi bi-search",
    },
    {
      title: "Téléconsultation",
      description:
        "Consultez des professionnels de santé à distance en toute sécurité.",
      icon: "bi bi-laptop",
    },
    {
      title: "Prise de Rendez-vous",
      description:
        "Prenez des rendez-vous en ligne avec les praticiens de votre choix.",
      icon: "bi bi-calendar-check",
    },
    {
      title: "Suivi Médical",
      description:
        "Accédez à vos dossiers médicaux et suivez votre état de santé.",
      icon: "bi bi-file-medical",
    },
  ];

  // Mock data for testimonials (static as these are user testimonials)
  const testimonials = [
    {
      name: "Awa Diop",
      role: "Patient",
      content:
        "AssitoSanté m'a permis de trouver rapidement un médecin spécialiste. L'interface est intuitive et les services sont excellents!",
      rating: 5,
    },
    {
      name: "Dr. Samba Ndiaye",
      role: "Médecin Généraliste",
      content:
        "Cette plateforme facilite vraiment mon travail quotidien. Je peux mieux organiser mes rendez-vous et suivre mes patients.",
      rating: 5,
    },
    {
      name: "Fatou Fall",
      role: "Patient",
      content:
        "Grâce à AssitoSanté, j'ai pu consulter un spécialiste sans attendre des heures. Un vrai soulagement pour les personnes âgées comme ma mère.",
      rating: 4,
    },
  ];

  // Function to fetch real statistics
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Fetching statistics...");

        // Fetch counts for each entity using direct API calls
        const [patientsCount, doctorsCount, clinicsCount, pharmaciesCount] =
          await Promise.all([
            // Get patients count
            api
              .get("patients/")
              .then((res) => res.data.length)
              .catch((err) => {
                console.error("Error fetching patients count:", err);
                return 0;
              }),
            // Get doctors count
            api
              .get("medecins/")
              .then((res) => res.data.length)
              .catch((err) => {
                console.error("Error fetching doctors count:", err);
                return 0;
              }),
            // Get clinics count
            api
              .get("cliniques/")
              .then((res) => res.data.length)
              .catch((err) => {
                console.error("Error fetching clinics count:", err);
                return 0;
              }),
            // Get pharmacies count
            api
              .get("pharmacies/")
              .then((res) => res.data.length)
              .catch((err) => {
                console.error("Error fetching pharmacies count:", err);
                return 0;
              }),
          ]);

        console.log("Counts:", {
          patientsCount,
          doctorsCount,
          clinicsCount,
          pharmaciesCount,
        });

        // Update stats with real counts
        setStats([
          {
            title: "Médecins",
            value: doctorsCount.toString(),
            icon: "bi bi-person-fill",
          },
          {
            title: "Patients",
            value: patientsCount.toString(),
            icon: "bi bi-people-fill",
          },
          {
            title: "Cliniques",
            value: clinicsCount.toString(),
            icon: "bi bi-hospital-fill",
          },
          {
            title: "Pharmacies",
            value: pharmaciesCount.toString(),
            icon: "bi bi-capsule",
          },
        ]);

        setLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error);
        setError(
          "Impossible de charger les statistiques. Affichage des données de démonstration."
        );

        // Fallback to mock data in case of error
        setStats([
          { title: "Médecins", value: "150+", icon: "bi bi-person-fill" },
          { title: "Patients", value: "5000+", icon: "bi bi-people-fill" },
          { title: "Cliniques", value: "25+", icon: "bi bi-hospital-fill" },
          { title: "Pharmacies", value: "100+", icon: "bi bi-capsule" },
        ]);

        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  // Function to render star ratings
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} style={{ color: i < rating ? "#ffc107" : "#ddd" }}>
        ★
      </span>
    ));
  };

  return (
    <>
      {/* Section principale sous le header */}
      <section
        className="position-relative overflow-hidden"
        style={{
          minHeight: "calc(100vh - 140px)",
          width: "100%",
          marginTop: "0px",
          padding: "40px 0",
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

        {/* Container fluide (pleine largeur, sans marges) */}
        <div className="container-fluid h-100">
          <div className="row align-items-center h-100">
            {/* Colonne gauche : Texte */}
            <div className="col-lg-6 px-5" style={{ color: "#333" }}>
              {/* Barre de recherche */}
              <div className="input-group mb-4">
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="RECHERCHEZ ICI..."
                  aria-label="Recherche"
                  style={{ fontSize: "15px" }}
                />
                <button
                  className="btn btn-danger btn-lg"
                  type="button"
                  style={{ padding: "5px" }}
                >
                  <i className="bi bi-search"></i>
                </button>
              </div>

              {/* Titre et texte */}
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
                une clinique ou encore accédez à nos services de
                téléconsultation.
              </p>
            </div>

            {/* Colonne droite : Carousel */}
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

                {/* Contrôles */}
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

      {/* Section des statistiques */}
      <section className="py-5" style={{ backgroundColor: "#f8f9fa" }}>
        <div className="container">
          <div className="row">
            <div className="col-12 text-center mb-5">
              <h2 className="fw-bold">Notre Plateforme en Chiffres</h2>
              <p className="text-muted">
                Découvrez l'impact de notre plateforme sur la communauté
                médicale
              </p>
              {error && <div className="alert alert-warning mt-3">{error}</div>}
            </div>
          </div>
          <div className="row g-4">
            {stats.map((stat, index) => (
              <div key={index} className="col-lg-3 col-md-6">
                <div className="card h-100 shadow-sm border-0 text-center">
                  <div className="card-body">
                    <div className="display-4 mb-3">
                      <i className={stat.icon}></i>
                    </div>
                    <h3 className="fw-bold text-primary">
                      {loading ? (
                        <div
                          className="spinner-border spinner-border-sm"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      ) : (
                        stat.value
                      )}
                    </h3>
                    <p className="text-muted mb-0">{stat.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section des services */}
      <section className="py-5">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center mb-5">
              <h2 className="fw-bold">Nos Services</h2>
              <p className="text-muted">
                Découvrez l'ensemble des services que nous offrons pour
                améliorer votre accès aux soins
              </p>
            </div>
          </div>
          <div className="row g-4">
            {services.map((service, index) => (
              <div key={index} className="col-lg-3 col-md-6">
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-body text-center">
                    <div className="display-4 mb-3">
                      <i className={service.icon}></i>
                    </div>
                    <h5 className="fw-bold mb-3">{service.title}</h5>
                    <p className="text-muted">{service.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section des témoignages */}
      <section className="py-5" style={{ backgroundColor: "#f8f9fa" }}>
        <div className="container">
          <div className="row">
            <div className="col-12 text-center mb-5">
              <h2 className="fw-bold">Témoignages</h2>
              <p className="text-muted">
                Découvrez ce que nos utilisateurs disent de notre plateforme
              </p>
            </div>
          </div>
          <div className="row g-4">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="col-lg-4 col-md-6">
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-body">
                    <div className="mb-3">
                      {renderStars(testimonial.rating)}
                    </div>
                    <p className="card-text mb-4">"{testimonial.content}"</p>
                    <div className="d-flex align-items-center">
                      <div className="ms-3">
                        <h6 className="mb-0">{testimonial.name}</h6>
                        <small className="text-muted">{testimonial.role}</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>
        {`
          /* Ensure carousel images display properly */
          .carousel-inner img {
            width: 100%;
            height: 400px;
            object-fit: cover;
            border-radius: 20px;
          }
          
          /* Fix for video background */
          .position-relative {
            position: relative !important;
          }
          
          .position-absolute {
            position: absolute !important;
          }
          
          /* Card hover effect */
          .card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          
          .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
          }
          
          /* Ensure Bootstrap Icons are loaded */
          .bi::before {
            display: inline-block;
            font-family: "bootstrap-icons" !important;
            font-style: normal;
            font-weight: normal !important;
            font-variant: normal;
            text-transform: none;
            line-height: 1;
            vertical-align: -.125em;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          /* Fix carousel caption visibility */
          .carousel-caption {
            color: white;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
          }
          
          .carousel-caption h5 {
            background-color: rgba(220, 53, 69, 0.85) !important;
            color: white !important;
          }
        `}
      </style>
    </>
  );
}

export default Accueil;