using System;
using System.Collections;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;

//DTO speculari ai record del backend (backend/Contracts).
//JsonUtility vuole i nomi dei campi identici al JSON: ASP.NET risponde in camelCase.
[Serializable]
public class CreateLobbyRequest {
    public string userId;
    public string displayName;
}

[Serializable]
public class TokenResult {
    public string token;
    public string url;
}

[Serializable]
public class CreateLobbyResponse {
    public string roomName;
    public TokenResult connection;
}

//Client HTTP verso il backend .NET
public static class LobbyApiClient {

    //POST /rooms: crea la stanza su LiveKit e restituisce il token da host
    public static IEnumerator CreateLobby(string backendUrl, string userId, string displayName,
        Action<CreateLobbyResponse> onSuccess, Action<string> onError) {

        var body = JsonUtility.ToJson(new CreateLobbyRequest { userId = userId, displayName = displayName });

        using var request = new UnityWebRequest($"{backendUrl.TrimEnd('/')}/rooms", UnityWebRequest.kHttpVerbPOST);
        request.uploadHandler = new UploadHandlerRaw(Encoding.UTF8.GetBytes(body));
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("Content-Type", "application/json");

        yield return request.SendWebRequest();

        if (request.result != UnityWebRequest.Result.Success) {
            onError?.Invoke($"{request.responseCode} {request.error} {request.downloadHandler.text}");
            yield break;
        }

        var response = JsonUtility.FromJson<CreateLobbyResponse>(request.downloadHandler.text);
        if (response?.connection == null || string.IsNullOrEmpty(response.connection.token)) {
            onError?.Invoke($"Risposta non valida: {request.downloadHandler.text}");
            yield break;
        }

        onSuccess?.Invoke(response);
    }
}
