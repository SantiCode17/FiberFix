package org.example.Server;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class Log {
    public static void escribirLog(String cadena){
        LocalDateTime ahora = LocalDateTime.now();
        DateTimeFormatter formato = DateTimeFormatter.ofPattern("dd/MM/yy:HH:mm:ss");
        String fechaFormateada = ahora.format(formato);
        try{
            BufferedWriter bufferedWriter = new BufferedWriter(new FileWriter("server_error.log",true));
            bufferedWriter.write(fechaFormateada+" "+cadena);
            bufferedWriter.newLine();
            bufferedWriter.close();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
