# Rafaam API Documentation

This document outlines the API endpoints required for the Rafaam backend integration. The frontend interacts with these endpoints via the `/api` proxy defined in `vite.config.ts`.

**Base URL**: `/api`

---

## Resources

### 1. Favorites (`/favorites`)

Manage the user's saved grammar points.

#### GET /favorites

Retrieve all favorite grammar points.

-   **Method**: `GET`
-   **Response**: `200 OK`
-   **Content-Type**: `application/json`
-   **Body**: Array of `GrammarPoint` objects.

**Example Response:**

```json
[
    {
        "pattern": "～てはいけません",
        "meaning": "Must not...",
        "explanation": "Used to express prohibition.",
        "examples": [
            {
                "text": "ここで写真を撮ってはいけません。",
                "phonetic": "Koko de shashin o totte wa ikemasen.",
                "translation": "You must not take photos here."
            }
        ]
    }
]
```

#### POST /favorites

Add a new grammar point to the user's favorites.

-   **Method**: `POST`
-   **Content-Type**: `application/json`
-   **Body**: A single `GrammarPoint` object.

**Request Body:**

```json
{
    "pattern": "～てもいいです",
    "meaning": "You may...",
    "explanation": "Used to express permission.",
    "examples": [
        {
            "text": "トイレに行ってもいいですか。",
            "phonetic": "Toire ni ittemo ii desu ka.",
            "translation": "May I go to the bathroom?"
        }
    ]
}
```

-   **Response**: `201 Created` (returns the saved object) or `200 OK`.

#### DELETE /favorites

Remove a grammar point from favorites based on the grammar pattern string.

-   **Method**: `DELETE`
-   **Content-Type**: `application/json`
-   **Body**: Object containing the `pattern` identifier.

**Request Body:**

```json
{
    "pattern": "～てもいいです"
}
```

-   **Response**: `200 OK`
-   **Body**:

```json
{
    "success": true
}
```

---

## Data Types

### GrammarPoint

| Field            | Type              | Description                                                    |
| ---------------- | ----------------- | -------------------------------------------------------------- |
| pattern          | string (Unique)   | The grammar structure (e.g., "～てはいけません")               |
| meaning          | string            | Brief meaning in the user's language                           |
| explanation      | string            | Detailed explanation                                           |
| practiceLanguage | string            | Target language id (`japanese`, `english`, `french`, `german`) |
| examples         | ExampleSentence[] | List of example sentences                                      |

### ExampleSentence

| Field       | Type   | Description                                        |
| ----------- | ------ | -------------------------------------------------- |
| text        | string | Example sentence in the selected practice language |
| phonetic    | string | Optional phonetic/romanized reading                |
| translation | string | Translation in the user's interface language       |

---

## Notes for Implementation

1. **Storage**: The backend should persist these records (e.g., SQLite, PostgreSQL, MongoDB, or a simple JSON file for MVP).
2. **Authentication**: Currently open (no auth). If multi-user support is added, headers (Authorization) should be handled here.
3. **Background Config**: The background image and blur settings are currently stored in the browser's `localStorage` (`rafaam_background_config`) to avoid sending large base64 images to the server unnecessarily. Only text data (Favorites) is synced to the backend.
