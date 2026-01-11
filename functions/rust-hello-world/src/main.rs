use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder};

#[get("/")]
async fn hello() -> impl Responder {
    println!("[rust-hello-world] Request received");
    HttpResponse::Ok().body("Hello from Rust Cloud Function!")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let port = std::env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let port: u16 = port.parse().unwrap();
    
    println!("[rust-hello-world] listening on port {}", port);

    HttpServer::new(|| {
        App::new()
            .service(hello)
    })
    .bind(("0.0.0.0", port))?
    .run()
    .await
}
