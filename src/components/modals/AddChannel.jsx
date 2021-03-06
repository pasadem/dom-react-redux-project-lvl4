import React, { useRef } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useFormik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useApi } from '../../hooks/index.js';
import { actions as channelsActions, selectors as channelsSelectors } from '../../slices/channelsSlice.js';


const AddChannel = ({ show, hideModal }) => {
  const inputRef = useRef(null);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const channelList = useSelector(channelsSelectors.selectAll);
  const api = useApi();

	const f = useFormik({
		initialValues: {
			channelName: '',
		},
    validationSchema: Yup.object().shape({
      channelName: Yup.string()
      .min(3, 'errors.channelName')
      .max(20, 'errorsChannelName')
      .notOneOf(channelList, 'erors.channelNameNotUnique')
      .required(),
    }),
    onSubmit: ({ channelName }) => {
      const channel = { name: channelName };
      const promise = new Promise((resolve) => {
        api.addNewChannel(channel, (err, data) => {
          if(err) {
            toast(t('errors.networkError'))
            return;
          }
          f.resetForm();
          hideModal();
          dispatch(channelsActions.addChannel(data));
          dispatch(channelsActions.setCurrentChannelId(data.id));
          toast(t('notifications.channelAdded'))
          resolve();
        });
      });
      return promise;
    }
	});

	return (
    <Modal
      show={show}
      onEntered={() => inputRef.current.focus()}
    >
      <Modal.Header closeButton onHide={hideModal}>
        <Modal.Title>{t('addChannel')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={f.handleSubmit}>
          <Form.Group controlId="channelName">
            <Form.Label className="visually-hidden">
              {t('channelName')}
            </Form.Label>
            <Form.Control
              autoFocus
              type="text"
              ref={inputRef}
              value={f.values.channelName}
              onChange={f.handleChange}
              disabled={f.isSubmitting}
              isInvalid={f.touched.channelName && f.errors.channelName}
            />
            <Form.Control.Feedback type="invalid">
              {t(f.errors.channelName)}
            </Form.Control.Feedback>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={hideModal}>
          {t('cancel')}
        </Button>
        <Button
          type="submit"
          onClick={f.handleSubmit}
          disabled={f.isSubmitting}
        >
          {t('send')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddChannel;
