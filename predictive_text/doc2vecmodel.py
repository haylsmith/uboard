from gensim.test.utils import common_texts
from gensim.models.doc2vec import Doc2Vec, TaggedDocument


print(common_texts)
documents = [TaggedDocument(doc, [i]) for i, doc in enumerate(common_texts)]
model = Doc2Vec(documents, vector_size=5, window=2, min_count=1, workers=4)




fname = "~/Desktop/my_doc2vec_model"
print(fname)
model.save(fname)
print("Saved model")
model = Doc2Vec.load(fname)  # you can continue training with the loaded model!
