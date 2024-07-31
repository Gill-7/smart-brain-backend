const { ClarifaiStub, grpc } = require("clarifai-nodejs-grpc");

const stub = ClarifaiStub.grpc();
const metadata = new grpc.Metadata();

metadata.set("authorization", `Key ${process.env.CLARIFAI_API_KEY}`);

const handleApiCall = (req, res) => {
  const USER_ID = "181801";
  const APP_ID = "smart-brain";
  const MODEL_ID = "face-detection";
  const IMAGE_URL = req.body.input;

  stub.PostModelOutputs(
    {
      user_app_id: {
        user_id: USER_ID,
        app_id: APP_ID,
      },
      model_id: MODEL_ID,

      inputs: [
        { data: { image: { url: IMAGE_URL, allow_duplicate_url: true } } },
      ],
    },
    metadata,
    (err, response) => {
      if (err) {
        throw new Error(err);
      }

      if (response.status.code !== 10000) {
        throw new Error(
          "Post model outputs failed, status: " + response.status.description
        );
      }
      const output = response.outputs[0];

      console.log("Predicted concepts:");
      for (const concept of output.data.concepts) {
        console.log(concept.name + " " + concept.value);
      }
      console.log(response);
      res.json(response);
    }
  );
};

const handleImage = (req, res, db) => {
  const { id } = req.body;
  db("users")
    .where("id", "=", id)
    .increment("entries", 1)
    .returning("entries")
    .then((entries) => {
      res.json(entries[0].entries);
    })
    .catch((err) => res.status(400).json("unable to get entries"));
};

module.exports = {
  handleImage: handleImage,
  handleApiCall: handleApiCall,
};
