import { db } from "./db";
import fs from "fs";

function render(view: string, content: string) {
  const layout = fs.readFileSync("./views/layout.html", "utf8");
  return layout.replace("{{content}}", content);
}

Bun.serve({
  port: 8080,
  async fetch(req) {
    const url = new URL(req.url);

    // LIST DATA
    if (url.pathname == "/") {
      const [rows]: any = await db.query("SELECT * FROM mahasiswa");
      let table = "";

      rows.forEach((m: any) => {
        table += `
          <tr>
            <td class="p-2">${m.id}</td>
            <td class="p-2">${m.nama}</td>
            <td class="p-2">${m.jurusan}</td>
            <td class="p-2">${m.angkatan}</td>
            <td class="p-2">
              <a class="text-blue-500" href="/edit/${m.id}">Edit</a>
              <a class="text-red-500 ml-2" href="/hapus/${m.id}">Hapus</a>
            </td>
          </tr>
        `;
      });

      let view = fs.readFileSync("./views/mahasiswa.html", "utf8");
      view = view.replace("{{rows}}", table);

      return new Response(render("mahasiswa", view), {
        headers: { "Content-Type": "text/html" },
      });
    }

    // FORM TAMBAH
    if (url.pathname == "/tambah") {
      let view = fs.readFileSync("./views/form.html", "utf8");
      view = view
        .replace("{{action}}", "/simpan")
        .replace("{{nama}}", "")
        .replace("{{jurusan}}", "")
        .replace("{{angkatan}}", "");

      return new Response(render("form", view), {
        headers: { "Content-Type": "text/html" },
      });
    }

    // SIMPAN DATA
    if (url.pathname == "/simpan" && req.method == "POST") {
      const body = await req.formData();
      await db.query(
        "INSERT INTO mahasiswa (nama, jurusan, angkatan) VALUES (?, ?, ?)",
        [body.get("nama"), body.get("jurusan"), body.get("angkatan")]
      );
      return Response.redirect("/", 302);
    }

    // FORM EDIT
    if (url.pathname.startsWith("/edit/") && req.method == "GET") {
      const id = url.pathname.split("/")[2];
      const [rows]: any = await db.query("SELECT * FROM mahasiswa WHERE id=?", [id]);
      const m = rows[0];

      let view = fs.readFileSync("./views/form.html", "utf8");
      view = view
        .replace("{{action}}", `/update/${id}`)
        .replace("{{nama}}", m.nama)
        .replace("{{jurusan}}", m.jurusan)
        .replace("{{angkatan}}", m.angkatan);

      return new Response(render("form", view), {
        headers: { "Content-Type": "text/html" },
      });
    }

    // UPDATE DATA
    if (url.pathname.startsWith("/update/") && req.method == "POST") {
      const id = url.pathname.split("/")[2];
      const body = await req.formData();

      await db.query("UPDATE mahasiswa SET nama=?, jurusan=?, angkatan=? WHERE id=?", [body.get("nama"), body.get("jurusan"), body.get("angkatan"), id]
      );
      return Response.redirect("/", 302);
    }

    // HAPUS DATA
    if (url.pathname.startsWith("/hapus/")) {
      const id = url.pathname.split("/")[2];
      await db.query("DELETE FROM mahasiswa WHERE id=?", [id]);
      return Response.redirect("/", 302);
    }

    // LIST JURUSAN
    if (url.pathname == "/jurusan") {
      const [rows]: any = await db.query("SELECT * FROM jurusan");
      let table = "";
      
      rows.forEach((j: any) => {
        table += `
        <tr>
          <td class="p-2">${j.id}</td>
          <td class="p-2">${j.nama_jurusan}</td>
            <td class="p-2">
            <a class="text-blue-500" href="/jurusan/edit/${j.id}">Edit</a>
            <a class="text-red-500 ml-2" href="/jurusan/hapus/${j.id}">Hapus</a>
          </td>
        </tr>
      `;
    });

    let view = fs.readFileSync("./views/jurusan.html", "utf8");
    view = view.replace("{{rows}}", table);

    return new Response(render("jurusan", view), {
     headers: { "Content-Type": "text/html" },
    });
  }

  // FORM TAMBAH JURUSAN
  if (url.pathname == "/jurusan/tambah") {
    let view = fs.readFileSync("./views/form-jurusan.html", "utf8");
    view = view
      .replace("{{action}}", "/jurusan/simpan")
      .replace("{{nama_jurusan}}", "");

    return new Response(render("form-jurusan", view), {
      headers: { "Content-Type": "text/html" },
    });
  }

  // SIMPAN JURUSAN
  if (url.pathname == "/jurusan/simpan" && req.method == "POST") {
    const body = await req.formData();
    await db.query(
      "INSERT INTO jurusan (nama_jurusan) VALUES (?)",
      [body.get("nama_jurusan")]
    );
    return Response.redirect("/jurusan", 302);
  }

  // FORM EDIT JURUSAN
  if (url.pathname.startsWith("/jurusan/edit/") && req.method == "GET") {
    const id = url.pathname.split("/")[3];
    const [rows]: any = await db.query(
      "SELECT * FROM jurusan WHERE id=?",
      [id]
    );
    const j = rows[0];

    let view = fs.readFileSync("./views/form-jurusan.html", "utf8");
    view = view
      .replace("{{action}}", `/jurusan/update/${id}`)
      .replace("{{nama_jurusan}}", j.nama_jurusan);

    return new Response(render("form-jurusan", view), {
      headers: { "Content-Type": "text/html" },
    });
  }

  // UPDATE JURUSAN
  if (url.pathname.startsWith("/jurusan/update/") && req.method == "POST") {
    const id = url.pathname.split("/")[3];
    const body = await req.formData();
    await db.query(
      "UPDATE jurusan SET nama_jurusan=? WHERE id=?",
      [body.get("nama_jurusan"), id]
    );
    return Response.redirect("/jurusan", 302);
  }

  // HAPUS JURUSAN
  if (url.pathname.startsWith("/jurusan/hapus/")) {
    const id = url.pathname.split("/")[3];
    await db.query("DELETE FROM jurusan WHERE id=?", [id]);
    return Response.redirect("/jurusan", 302);
  }
    return new Response("Not Found");
  }
});