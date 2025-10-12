import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Alert,
  Spinner,
} from "react-bootstrap";
import medicationService from "../../services/medicationService";

function MedicationReminders() {
  const [reminders, setReminders] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [formData, setFormData] = useState({
    medicament: "",
    dosage: "",
    frequence: "",
    heure_rappel: "",
    date_debut: "",
    date_fin: "",
    notes: "",
  });

  useEffect(() => {
    loadReminders();
    loadHistory();
  }, []);

  const loadReminders = async () => {
    try {
      setLoading(true);
      const data = await medicationService.getReminders();
      setReminders(data);
    } catch (err) {
      setError("Erreur lors du chargement des rappels");
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const data = await medicationService.getHistory();
      setHistory(data);
    } catch (err) {
      setError("Erreur lors du chargement de l'historique");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingReminder) {
        await medicationService.updateReminder(editingReminder.id, formData);
      } else {
        await medicationService.createReminder(formData);
      }
      setShowModal(false);
      setEditingReminder(null);
      setFormData({
        medicament: "",
        dosage: "",
        frequence: "",
        heure_rappel: "",
        date_debut: "",
        date_fin: "",
        notes: "",
      });
      loadReminders();
      setError("");
    } catch (err) {
      setError("Erreur lors de l'enregistrement du rappel");
    }
  };

  const handleEdit = (reminder) => {
    setEditingReminder(reminder);
    setFormData({
      medicament: reminder.medicament,
      dosage: reminder.dosage,
      frequence: reminder.frequence,
      heure_rappel: reminder.heure_rappel,
      date_debut: reminder.date_debut,
      date_fin: reminder.date_fin || "",
      notes: reminder.notes || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce rappel ?")) {
      try {
        await medicationService.deleteReminder(id);
        loadReminders();
      } catch (err) {
        setError("Erreur lors de la suppression du rappel");
      }
    }
  };

  const handleMarkTaken = async (id) => {
    try {
      await medicationService.markTaken(id);
      loadHistory();
    } catch (err) {
      setError("Erreur lors du marquage comme pris");
    }
  };

  const openModal = () => {
    setEditingReminder(null);
    setFormData({
      medicament: "",
      dosage: "",
      frequence: "",
      heure_rappel: "",
      date_debut: "",
      date_fin: "",
      notes: "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingReminder(null);
  };

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <Spinner animation="border" />
          <p>Chargement des rappels de médicaments...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>
            <i className="bi bi-alarm me-2"></i>
            Rappels de Médicaments
          </h2>
          <p className="text-muted">
            Gérez vos rappels de prise de médicaments et suivez votre historique
          </p>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={openModal}>
            <i className="bi bi-plus-lg me-1"></i>
            Ajouter un rappel
          </Button>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          {error}
        </Alert>
      )}

      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>
              <i className="bi bi-bell me-2"></i>
              Rappels Actifs
            </Card.Header>
            <Card.Body>
              {reminders.length === 0 ? (
                <div className="text-center py-4">
                  <i
                    className="bi bi-alarm text-muted"
                    style={{ fontSize: "3rem" }}
                  ></i>
                  <p className="mt-2">Aucun rappel de médicament configuré</p>
                  <Button variant="primary" onClick={openModal}>
                    <i className="bi bi-plus-lg me-1"></i>
                    Créer votre premier rappel
                  </Button>
                </div>
              ) : (
                <div className="list-group">
                  {reminders.map((reminder) => (
                    <div key={reminder.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h5 className="mb-1">
                            <i className="bi bi-capsule me-2"></i>
                            {reminder.medicament}
                          </h5>
                          <p className="mb-1">
                            <strong>Dosage:</strong> {reminder.dosage} |
                            <strong> Fréquence:</strong> {reminder.frequence}
                          </p>
                          <p className="mb-1">
                            <i className="bi bi-clock me-1"></i>
                            Rappel à {reminder.heure_rappel}
                          </p>
                          <small className="text-muted">
                            Du{" "}
                            {new Date(reminder.date_debut).toLocaleDateString()}
                            {reminder.date_fin &&
                              ` au ${new Date(
                                reminder.date_fin
                              ).toLocaleDateString()}`}
                          </small>
                        </div>
                        <div>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-1"
                            onClick={() => handleEdit(reminder)}
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(reminder.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </div>
                      {reminder.notes && (
                        <div className="mt-2">
                          <small className="text-muted">
                            <i className="bi bi-info-circle me-1"></i>
                            {reminder.notes}
                          </small>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Header>
              <i className="bi bi-clock-history me-2"></i>
              Historique des Prises
            </Card.Header>
            <Card.Body>
              {history.length === 0 ? (
                <div className="text-center py-4">
                  <i
                    className="bi bi-clock text-muted"
                    style={{ fontSize: "3rem" }}
                  ></i>
                  <p className="mt-2">Aucun historique de prise</p>
                </div>
              ) : (
                <div className="list-group">
                  {history.slice(0, 10).map((entry) => (
                    <div key={entry.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{entry.rappel_medicament}</strong>
                          <br />
                          <small className="text-muted">
                            {new Date(entry.date_prise).toLocaleString()}
                          </small>
                        </div>
                        <div>
                          {entry.prise_effectuee ? (
                            <span className="badge bg-success">
                              <i className="bi bi-check-circle me-1"></i>
                              Pris
                            </span>
                          ) : (
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleMarkTaken(entry.id)}
                            >
                              Marquer comme pris
                            </Button>
                          )}
                        </div>
                      </div>
                      {entry.notes && (
                        <div className="mt-1">
                          <small className="text-muted">{entry.notes}</small>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal for adding/editing reminders */}
      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingReminder ? "Modifier le rappel" : "Ajouter un rappel"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nom du médicament *</Form.Label>
              <Form.Control
                type="text"
                value={formData.medicament}
                onChange={(e) =>
                  setFormData({ ...formData, medicament: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Dosage *</Form.Label>
              <Form.Control
                type="text"
                value={formData.dosage}
                onChange={(e) =>
                  setFormData({ ...formData, dosage: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Fréquence *</Form.Label>
              <Form.Control
                type="text"
                value={formData.frequence}
                onChange={(e) =>
                  setFormData({ ...formData, frequence: e.target.value })
                }
                required
                placeholder="Ex: 1 fois par jour, 2 fois par semaine"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Heure du rappel *</Form.Label>
              <Form.Control
                type="time"
                value={formData.heure_rappel}
                onChange={(e) =>
                  setFormData({ ...formData, heure_rappel: e.target.value })
                }
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date de début *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.date_debut}
                    onChange={(e) =>
                      setFormData({ ...formData, date_debut: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date de fin</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.date_fin}
                    onChange={(e) =>
                      setFormData({ ...formData, date_fin: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Instructions supplémentaires..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModal}>
              Annuler
            </Button>
            <Button variant="primary" type="submit">
              {editingReminder ? "Mettre à jour" : "Créer"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default MedicationReminders;
