## Week 4 Reflection

1. What is the difference between the SQLAlchemy model and the Pydantic schema?
They're both about "Book" but they serve different purposes.

The SQLAlchemy model is what talks to the database — it defines the table columns and lets you query or save rows. The Pydantic schema is what talks to the API — it validates the data coming in from a request and controls what gets sent back in the response. So the SQLAlchemy model is about storage, and Pydantic is about the shape of the data at the API boundary. You need both because you don't always want to expose every database column to the outside world.

2. What does `Depends(get_db)` do? Why does every endpoint need it?

`get_db` is a function that opens a database session and closes it when the request is done. `Depends(get_db)` tells FastAPI to run that function and pass the result in as the `db` argument. Every endpoint needs it because every endpoint that reads or writes data needs an active connection to the database — without it there is nothing to query.

3. When you restarted the server and your data was still there — how does that feel
compared to storing data in a Python list? What changed architecturally?

It felt really different. Before, every restart wiped everything because the list only lived in memory while the process was running. Now the data lives in Postgres, which is a completely separate process. The app and the data are decoupled — the server can crash, restart, or be replaced and the data is unaffected. That feels much more like a real application.

4. What was the most confusing part of connecting the frontend to the backend?

CORS was the most confusing part. The frontend and backend are both running on my machine but on different ports, and the browser still blocked the requests. I didn't expect that — I thought CORS was only a problem when the servers are on different domains. Also making sure the environment variable `NEXT_PUBLIC_API_URL` was set correctly took some debugging, because if it's wrong the fetch just silently hangs.

5. When does CORS become a problem and why? In your own words.

CORS becomes a problem whenever a browser makes a request to a different origin than the page it loaded from. Origin means the combination of protocol, domain, and port — so `localhost:3000` and `localhost:8000` are different origins even though they're on the same machine. The browser blocks the request by default as a security measure to stop random websites from making requests to your bank or other services on your behalf. The server has to explicitly say "I allow requests from this origin" by sending the right headers, otherwise the browser refuses to hand the response to your JavaScript.

6. What is the difference between useEffect with [] and without it?

`useEffect` with `[]` runs only once when the component first mounts. That's what you want for fetching data — you only need to load it once when the page opens. Without the `[]`, the effect runs after every single render, which means it would fire in an infinite loop if the effect itself causes a state update (like saving the fetched data). So `[]` is basically saying "only do this on the first load, not every time anything changes."
