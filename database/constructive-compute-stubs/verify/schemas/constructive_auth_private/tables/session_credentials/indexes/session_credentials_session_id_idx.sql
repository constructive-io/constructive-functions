-- Verify: schemas/constructive_auth_private/tables/session_credentials/indexes/session_credentials_session_id_idx


SELECT verify_index('constructive_auth_private.session_credentials', 'session_credentials_session_id_idx');


