var gl;
var shaderProgram;
var modelview_uniform;
var normal_uniform;
var projection_uniform;
var texture, texture2, texture3;
var sampler_uniform;
var sampler2_uniform;
var sampler3_uniform;
var teapot_vao;
var vert_pos_attr;
var vert_normal_attr;

//
// load the vertex shader
//

var vs = vert_shader;

//
// load the fragment shader
//
var fs = frac_shader;


function initwebgl() {

  //
  // create a graphics context
  //

  var canvas = document.getElementById("myGLCanvas");
  gl = canvas.getContext("webgl2");
  if (!gl)
    alert("Failed to create WebGL context!");

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  loadshaders(vs,fs);

  // set up vertex array object
 
  teapot_vao = gl.createVertexArray();
  gl.bindVertexArray(teapot_vao);

  // create a coordinate buffer of vertex positions and
  // connect it to the vertex shader positions
 
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER,
                new Float32Array(teapot.positions),
                gl.STATIC_DRAW);

  gl.enableVertexAttribArray(vert_pos_attr);
  gl.vertexAttribPointer(vert_pos_attr, 3, gl.FLOAT, false, 0, 0);

  // create a coordinate buffer of vertex positions and
  // connect it to the vertex shader positions
  // but normalize the normals first

  var x,y,z,d,i;
  for (i = 0; i < teapot.normals.length; i += 3) {
    x = teapot.normals[i];
    y = teapot.normals[i+1];
    z = teapot.normals[i+2];

    d = 1.0/Math.sqrt(x*x + y*y + z*z);

    teapot.normals[i] *= d;
    teapot.normals[i+1] *= d;
    teapot.normals[i+2] *= d;
    
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER,
                new Float32Array(teapot.normals),
                gl.STATIC_DRAW);

  gl.enableVertexAttribArray(vert_normal_attr);
  gl.vertexAttribPointer(vert_normal_attr, 3, gl.FLOAT, false, 0, 0);

  // create an index buffer of triangle faces

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer()); 
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
                new Uint16Array(teapot.faces),
                gl.STATIC_DRAW);

  let imageSize = 512;
  //
  // set up texture and sampler
  //

  texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  var sampler = gl.createSampler();
  gl.bindSampler(0, sampler);

  //
  // load texture image using webgl2fundamentals boilerplate
  // initially creates just a 1x1 blue pixel as a placeholder
  // replaced by actual texture image once loaded
  //

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA,
                gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

  var image = new Image();
  image.src = `illinois${imageSize}.png`;

  image.addEventListener("load", function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, imageSize, imageSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);
  });

  //
  // set up second texture and sampler
  //

  texture2 = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture2);
  // gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  var sampler2 = gl.createSampler();
  gl.bindSampler(1, sampler2);

  //
  // load texture image using webgl2fundamentals boilerplate
  // initially creates just a 1x1 blue pixel as a placeholder
  // replaced by actual texture image once loaded
  //

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA,
                gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

  var image2 = new Image();
  image2.src = "stadium sphere.jpg";
    
  image2.addEventListener("load", function() {
    gl.bindTexture(gl.TEXTURE_2D, texture2);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 256, 0, gl.RGBA, gl.UNSIGNED_BYTE, image2);
    gl.generateMipmap(gl.TEXTURE_2D);
  });

  //
  // set up third texture and sampler
  //

  texture3 = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture3);
  // gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  var sampler3 = gl.createSampler();
  gl.bindSampler(2, sampler3);

  //
  // load texture image using webgl2fundamentals boilerplate
  // initially creates just a 1x1 blue pixel as a placeholder
  // replaced by actual texture image once loaded
  //

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA,
                gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

  var image3 = new Image();
  image3.src = `i${imageSize}_bump.png`;

  image3.addEventListener("load", function() {
    gl.bindTexture(gl.TEXTURE_2D, texture3);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, imageSize, imageSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image3);
    gl.generateMipmap(gl.TEXTURE_2D);
  });

  //
  // set up transformation matrices
  //

  projection = glMatrix.mat4.create();
  glMatrix.mat4.perspective(projection, Math.PI/6, 1.0, 0.1);

  requestAnimationFrame(draw);
}

function loadshaders(vertexShaderSource,fragmentShaderSource) {
  var vstextbox = document.getElementById("vertexshader");

  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS))
    alert("Vertex Shader Error:\n" + gl.getShaderInfoLog(vertexShader));

  var fstextbox = document.getElementById("fragmentshader");

  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS))
    alert("Fragment Shader Error:\n" + gl.getShaderInfoLog(fragmentShader));

  //
  // Compile shaders and get link ID's to the attributes and uniforms
  //

  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
    alert("Failed to setup shaders");

  vert_pos_attr = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  vert_normal_attr = gl.getAttribLocation(shaderProgram, "aVertexNormal");
  modelview_uniform = gl.getUniformLocation(shaderProgram, "uModelViewMatrix"); 
  normal_uniform = gl.getUniformLocation(shaderProgram, "uNormalMatrix"); 
  projection_uniform = gl.getUniformLocation(shaderProgram, "uProjectionMatrix"); 
  sampler_uniform = gl.getUniformLocation(shaderProgram, "uSampler"); 
  sampler2_uniform = gl.getUniformLocation(shaderProgram, "uSampler2"); 
  sampler3_uniform = gl.getUniformLocation(shaderProgram, "uSampler3"); 
}

//
// draw callback function that is passed to requestAnimationFrame()
//

function draw(time) {
  gl.clearColor(0.075, 0.16, 0.294, 1.0);
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  modelview = glMatrix.mat4.create();
  glMatrix.mat4.translate(modelview,modelview,[0.0, 0.0, -2.0]);
  glMatrix.mat4.rotateY(modelview,modelview, time*0.001);

  normalmatrix = glMatrix.mat3.create();
  glMatrix.mat3.normalFromMat4(normalmatrix,modelview);

  gl.useProgram(shaderProgram);

  gl.uniformMatrix4fv(modelview_uniform, false, modelview);
  gl.uniformMatrix3fv(normal_uniform, false, normalmatrix);
  gl.uniformMatrix4fv(projection_uniform, false, projection);

  gl.uniform1i(sampler_uniform,0);
  gl.uniform1i(sampler2_uniform,1);
  gl.uniform1i(sampler3_uniform,2);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture2);
  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, texture3);

  gl.bindVertexArray(teapot_vao);
  gl.drawElements(gl.TRIANGLES,
                  teapot.faces.length,
                  gl.UNSIGNED_SHORT,
                  0);

  requestAnimationFrame(draw);
}